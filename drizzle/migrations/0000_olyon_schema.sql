
create type public.app_role as enum ('admin','user');
create type public.order_status as enum ('pending','confirmed','packed','shipped','out_for_delivery','delivered','cancelled');

-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

-- roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles read" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- signup trigger: profile + role (first user becomes admin)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), new.raw_user_meta_data->>'phone');
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- categories
create table public.categories (
  slug text primary key,
  name text not null,
  icon text not null,
  sort int not null default 0
);
grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "categories public" on public.categories for select to anon, authenticated using (true);

-- products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text not null default '',
  description text not null default '',
  category text not null references public.categories(slug),
  price int not null check (price >= 0),
  compare_at int,
  stock int not null default 0 check (stock >= 0),
  image text not null,
  colors jsonb not null default '[]'::jsonb,
  features text[] not null default '{}',
  rating numeric(2,1) not null default 4.5,
  reviews int not null default 0,
  badge text,
  featured boolean not null default false,
  trending boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "products public read" on public.products for select to anon, authenticated using (active or public.has_role(auth.uid(),'admin'));
create policy "admin insert products" on public.products for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update products" on public.products for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete products" on public.products for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- cart
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_id uuid not null references public.products(id) on delete cascade,
  color text not null default '',
  quantity int not null check (quantity between 1 and 20),
  created_at timestamptz not null default now(),
  unique (user_id, product_id, color)
);
grant select, insert, update, delete on public.cart_items to authenticated;
grant all on public.cart_items to service_role;
alter table public.cart_items enable row level security;
create policy "own cart" on public.cart_items for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- wishlist
create table public.wishlist (
  user_id uuid not null,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
grant select, insert, delete on public.wishlist to authenticated;
grant all on public.wishlist to service_role;
alter table public.wishlist enable row level security;
create policy "own wishlist" on public.wishlist for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- addresses
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  full_name text not null check (char_length(full_name) between 2 and 80),
  phone text not null check (phone ~ '^[0-9+ ]{8,15}$'),
  line1 text not null check (char_length(line1) between 3 and 160),
  city text not null check (char_length(city) between 2 and 60),
  state text not null check (char_length(state) between 2 and 60),
  pincode text not null check (pincode ~ '^[0-9]{6}$'),
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.addresses to authenticated;
grant all on public.addresses to service_role;
alter table public.addresses enable row level security;
create policy "own addresses" on public.addresses for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- coupons
create table public.coupons (
  code text primary key,
  percent int not null check (percent between 1 and 90),
  max_discount int not null default 100000,
  min_subtotal int not null default 0,
  active boolean not null default true
);
grant select on public.coupons to authenticated;
grant all on public.coupons to service_role;
alter table public.coupons enable row level security;
create policy "coupons read" on public.coupons for select to authenticated using (active);

-- orders
create sequence public.order_number_seq start 104500;
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null default ('OLY' || nextval('public.order_number_seq')),
  user_id uuid not null,
  idempotency_key uuid not null unique,
  status order_status not null default 'pending',
  payment_method text not null default 'cod',
  delivery text not null default 'standard',
  shipping_address jsonb not null,
  subtotal int not null,
  discount int not null default 0,
  shipping int not null default 0,
  total int not null,
  coupon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "own or admin orders read" on public.orders for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "admin update orders" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  image text not null,
  color text not null default '',
  unit_price int not null,
  quantity int not null
);
grant select on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "order items read" on public.order_items for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.has_role(auth.uid(),'admin'))));

create table public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status order_status not null,
  note text,
  created_at timestamptz not null default now()
);
grant select on public.order_events to authenticated;
grant all on public.order_events to service_role;
alter table public.order_events enable row level security;
create policy "order events read" on public.order_events for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.has_role(auth.uid(),'admin'))));

-- log status changes; restock on cancel
create or replace function public.log_order_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.order_events (order_id, status) values (new.id, new.status);
    new.updated_at := now();
    if tg_op = 'UPDATE' and new.status = 'cancelled' and old.status <> 'cancelled' then
      update public.products p set stock = p.stock + oi.quantity
        from public.order_items oi where oi.order_id = new.id and oi.product_id = p.id;
    end if;
  end if;
  return new;
end; $$;
create trigger orders_status_update before update on public.orders for each row execute function public.log_order_status();
create or replace function public.log_order_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.order_events (order_id, status) values (new.id, new.status); return new; end; $$;
create trigger orders_status_insert after insert on public.orders for each row execute function public.log_order_insert();

-- place order (server-side pricing, stock locking, idempotent)
create or replace function public.place_order(_address_id uuid, _delivery text, _coupon text, _idempotency_key uuid)
returns table (order_id uuid, order_number text)
language plpgsql security definer set search_path = public as $$
declare
  _uid uuid := auth.uid();
  _existing record;
  _addr record;
  _item record;
  _subtotal int := 0;
  _discount int := 0;
  _shipping int := 0;
  _cp record;
  _oid uuid;
  _onum text;
  _count int := 0;
begin
  if _uid is null then raise exception 'Not authenticated'; end if;
  if _delivery not in ('standard','express') then raise exception 'Invalid delivery option'; end if;

  select o.id, o.order_number into _existing from public.orders o where o.idempotency_key = _idempotency_key and o.user_id = _uid;
  if found then return query select _existing.id, _existing.order_number; return; end if;

  select * into _addr from public.addresses a where a.id = _address_id and a.user_id = _uid;
  if not found then raise exception 'Please select a valid shipping address'; end if;

  for _item in
    select c.quantity, c.color, p.id pid, p.name, p.image, p.price, p.stock, p.active
    from public.cart_items c join public.products p on p.id = c.product_id
    where c.user_id = _uid order by p.id for update of p
  loop
    _count := _count + 1;
    if not _item.active then raise exception '% is no longer available', _item.name; end if;
    if _item.stock < _item.quantity then raise exception 'Only % left of %', _item.stock, _item.name; end if;
    _subtotal := _subtotal + _item.price * _item.quantity;
  end loop;
  if _count = 0 then raise exception 'Your cart is empty'; end if;

  if _coupon is not null and length(trim(_coupon)) > 0 then
    select * into _cp from public.coupons where code = upper(trim(_coupon)) and active;
    if not found then raise exception 'Invalid coupon code'; end if;
    if _subtotal < _cp.min_subtotal then raise exception 'Coupon requires a minimum of ₹%', _cp.min_subtotal; end if;
    _discount := least(_cp.max_discount, (_subtotal * _cp.percent) / 100);
  end if;

  _shipping := case when _delivery = 'express' then 99 when _subtotal >= 999 then 0 else 49 end;

  insert into public.orders (user_id, idempotency_key, delivery, shipping_address, subtotal, discount, shipping, total, coupon)
  values (_uid, _idempotency_key, _delivery,
    jsonb_build_object('full_name',_addr.full_name,'phone',_addr.phone,'line1',_addr.line1,'city',_addr.city,'state',_addr.state,'pincode',_addr.pincode),
    _subtotal, _discount, _shipping, _subtotal - _discount + _shipping, case when _discount > 0 then upper(trim(_coupon)) end)
  returning id, orders.order_number into _oid, _onum;

  insert into public.order_items (order_id, product_id, name, image, color, unit_price, quantity)
  select _oid, p.id, p.name, p.image, c.color, p.price, c.quantity
  from public.cart_items c join public.products p on p.id = c.product_id where c.user_id = _uid;

  update public.products p set stock = p.stock - c.qty
  from (select product_id, sum(quantity) qty from public.cart_items where user_id = _uid group by product_id) c
  where p.id = c.product_id;

  delete from public.cart_items where user_id = _uid;
  return query select _oid, _onum;
end; $$;
revoke all on function public.place_order(uuid,text,text,uuid) from public, anon;
grant execute on function public.place_order(uuid,text,text,uuid) to authenticated;

-- customers may cancel their own pending/confirmed orders
create or replace function public.cancel_my_order(_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.orders set status = 'cancelled'
  where id = _order_id and user_id = auth.uid() and status in ('pending','confirmed');
  if not found then raise exception 'This order can no longer be cancelled'; end if;
end; $$;
revoke all on function public.cancel_my_order(uuid) from public, anon;
grant execute on function public.cancel_my_order(uuid) to authenticated;

-- seed
insert into public.categories (slug,name,icon,sort) values
 ('home','Home Essentials','sparkles',1),('tech','Gadgets & Tech','smartphone',2),('beauty','Beauty & Self Care','flower',3),
 ('lifestyle','Lifestyle & Wellness','leaf',4),('fashion','Fashion & Accessories','shirt',5),('gifts','Gifts & More','gift',6);

insert into public.coupons (code,percent,max_discount,min_subtotal) values ('FOREST10',10,500,999),('OLYON20',20,1000,2499);

insert into public.products (slug,name,tagline,description,category,price,compare_at,stock,image,colors,features,rating,reviews,badge,featured,trending) values
('galaxy-projector','Galaxy Projector','Turn any room into a starry galaxy','A sculpted dome that projects a slow-drifting nebula across your ceiling. Multiple colour modes, 360° rotation, timer and remote included.','home',1499,2999,42,'galaxy','[{"name":"Black","hex":"#1a1a1f"},{"name":"Moon","hex":"#e6e3df"},{"name":"Nebula","hex":"#6b3fa0"}]','{"Starry sky projection","Multiple colours","360° rotation","Remote control"}',4.7,12498,'Viral',true,true),
('smart-led-mirror','Smart LED Mirror','Touch control & dimmable','An arched vanity mirror with a soft halo light ring, three colour temperatures and anti-fog glass.','beauty',2999,5999,18,'mirror','[{"name":"White","hex":"#f2efe9"},{"name":"Gold","hex":"#c9a96e"}]','{"Touch control","3 light tones","Anti-fog","USB-C powered"}',4.6,6211,'Trending',true,true),
('portable-blender','Portable Blender','Blend anywhere','A cordless, rechargeable blender for smoothies on the go. Six stainless blades and a leak-proof lid.','lifestyle',1799,3499,30,'blender','[{"name":"Green","hex":"#6f7d4a"},{"name":"Cream","hex":"#efe8da"},{"name":"Plum","hex":"#5a3550"}]','{"Cordless","6 blades","USB rechargeable","BPA free"}',4.5,8890,'Bestseller',true,false),
('aroma-diffuser','Stone Aroma Diffuser','Calm, in every breath','Ceramic stone diffuser with ultrasonic mist, warm ambient glow and auto shut-off.','home',1299,2199,25,'diffuser','[{"name":"Stone","hex":"#cfc8bc"},{"name":"Charcoal","hex":"#3a3a3a"}]','{"Ultrasonic mist","Ambient light","Auto shut-off","Whisper quiet"}',4.6,3120,null,true,true),
('levitating-planter','Levitating Planter','A plant that floats','Magnetic levitation planter that slowly rotates a small succulent in mid-air.','gifts',3499,4999,8,'planter','[{"name":"Walnut","hex":"#6b4a33"},{"name":"Ivory","hex":"#efe9df"}]','{"Magnetic levitation","Slow rotation","LED base","Gift boxed"}',4.4,1544,'Limited',false,true),
('forest-earbuds','Forest ANC Earbuds','Silence, beautifully','Wireless earbuds with active noise cancelling, 32-hour battery and a matte olive case.','tech',2499,4499,50,'earbuds','[{"name":"Olive","hex":"#4d5a35"},{"name":"Plum","hex":"#3d2638"},{"name":"White","hex":"#f4f2ee"}]','{"Active noise cancel","32h battery","IPX5","Wireless charging"}',4.5,5402,null,true,false),
('silk-sleep-mask','Mulberry Silk Set','Rest like royalty','Pure mulberry silk sleep mask and scrunchie set for gentler skin and hair.','beauty',899,1599,60,'silk','[{"name":"Plum","hex":"#5a3550"},{"name":"Sage","hex":"#9aa58a"}]','{"22 momme silk","Hypoallergenic","Adjustable","Gift pouch"}',4.8,2210,null,false,true),
('canvas-tote','Botanical Canvas Tote','Carry the forest','Heavy organic canvas tote with leather handles and an inner zip pocket.','fashion',1199,1899,0,'tote','[{"name":"Olive","hex":"#4d5a35"},{"name":"Natural","hex":"#e6dcc8"}]','{"Organic canvas","Leather handles","Zip pocket","Water resistant"}',4.3,880,null,false,false);
