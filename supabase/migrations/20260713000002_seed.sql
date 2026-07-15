-- Seed inicial: categorías y productos de ejemplo
insert into public.categories (name, slug, position) values
  ('Anillos', 'anillos', 1),
  ('Collares', 'collares', 2),
  ('Pulseras', 'pulseras', 3),
  ('Aros', 'aros', 4);

with cat as (select id, slug from public.categories)
insert into public.products (category_id, name, slug, description, price, stock, low_stock_threshold)
values
  ((select id from cat where slug = 'anillos'), 'Anillo Solitario Plata 925', 'anillo-solitario-plata-925',
   'Anillo solitario de plata 925 con circonia cúbica. Elegante y atemporal.', 45000, 12, 3),
  ((select id from cat where slug = 'anillos'), 'Anillo Alianza Oro 18k', 'anillo-alianza-oro-18k',
   'Alianza clásica de oro 18 kilates, terminación pulida.', 320000, 5, 2),
  ((select id from cat where slug = 'collares'), 'Collar Cadena Veneciana', 'collar-cadena-veneciana',
   'Cadena veneciana de plata 925, 45 cm, con cierre reforzado.', 38000, 20, 5),
  ((select id from cat where slug = 'collares'), 'Collar con Dije Corazón', 'collar-dije-corazon',
   'Collar de plata con dije de corazón y baño de rodio.', 52000, 8, 3),
  ((select id from cat where slug = 'pulseras'), 'Pulsera Tennis Circonias', 'pulsera-tennis-circonias',
   'Pulsera tennis con circonias engarzadas, plata 925.', 68000, 6, 2),
  ((select id from cat where slug = 'pulseras'), 'Pulsera Esclava Grabable', 'pulsera-esclava-grabable',
   'Esclava de plata lisa, ideal para grabado personalizado.', 42000, 15, 4),
  ((select id from cat where slug = 'aros'), 'Aros Argolla 20mm', 'aros-argolla-20mm',
   'Argollas clásicas de plata 925, 20 mm de diámetro.', 28000, 25, 5),
  ((select id from cat where slug = 'aros'), 'Aros Abridores Oro', 'aros-abridores-oro',
   'Aros abridores de oro 18k, hipoalergénicos.', 95000, 4, 2);

-- variantes de ejemplo (talles de anillos)
with p as (select id from public.products where slug = 'anillo-solitario-plata-925')
insert into public.product_variants (product_id, name, stock)
values
  ((select id from p), 'Talle 15', 4),
  ((select id from p), 'Talle 16', 5),
  ((select id from p), 'Talle 17', 3);

-- cupón de ejemplo
insert into public.coupons (code, discount_type, value, active)
values ('BIENVENIDA10', 'percent', 10, true);
