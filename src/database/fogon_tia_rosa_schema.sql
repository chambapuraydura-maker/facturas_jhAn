BEGIN TRANSACTION;
CREATE TABLE categorias (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre    TEXT    NOT NULL,
    tipo      TEXT    NOT NULL CHECK(tipo IN ('comida','bebida')),
    orden     INTEGER DEFAULT 0
);
INSERT INTO "categorias" VALUES(1,'Desayunos','comida',1);
INSERT INTO "categorias" VALUES(2,'Raciones','comida',2);
INSERT INTO "categorias" VALUES(3,'Bocadillos y Hamburguesas','comida',3);
INSERT INTO "categorias" VALUES(4,'Pollo y Parrillas','comida',4);
INSERT INTO "categorias" VALUES(5,'Algo Más','comida',5);
INSERT INTO "categorias" VALUES(6,'Postres','comida',6);
INSERT INTO "categorias" VALUES(7,'Bebidas','bebida',7);
CREATE TABLE productos (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    nombre      TEXT    NOT NULL,
    precio      REAL    NOT NULL DEFAULT 0,
    iva_pct     REAL    NOT NULL DEFAULT 10,   -- 10 comida / 21 bebida
    tipo        TEXT    NOT NULL CHECK(tipo IN ('comida','bebida')),
    activo      INTEGER NOT NULL DEFAULT 1,    -- 1=activo 0=inactivo
    creado_en   TEXT    DEFAULT (datetime('now'))
);
INSERT INTO "productos" VALUES(1,1,'Arepitas de degustación 5 uds',11.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(2,1,'Arepa colombiana + chorizo',6.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(3,1,'Arepa de chicharrón sola',3.2,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(4,1,'Arepa de chicharrón 1 relleno',9.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(5,1,'Arepa de chicharrón mixta',10.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(6,1,'Arepa de chicharrón 3 rellenos',12.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(7,1,'Arepita con nata 5 uds',7.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(8,1,'Desayuno criollo venezolano',10.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(9,1,'Recalentado colombiano',10.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(10,1,'Huevo perico + arepa + café',7.99,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(11,1,'Buñuelos',1.6,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(12,1,'Pan de bono / almojábanas',1.6,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(13,1,'Empanadas',3.8,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(14,1,'Empanadas mixtas',5.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(15,1,'Empanadas pabellón y 3 contornos',6.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(16,1,'Empanadas colombiana',2.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(17,1,'Pastelitos',2.8,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(18,1,'Papa rellena',3.2,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(19,1,'Cachitos de jamón',3.3,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(20,1,'Cachitos de jamón / queso',3.8,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(21,1,'Napolitana',1.3,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(22,1,'Ración de pizza',2.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(23,1,'Sandwich mixto',3.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(24,1,'Sandwich mixto + huevo',4.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(25,1,'Pincho de tortilla',3.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(26,1,'Arepas 1 relleno',8.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(27,1,'Arepas mixtas',9.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(28,1,'Arepas 3 rellenos y pabellón',11.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(29,1,'Plato Margarita',9.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(30,2,'Tequeños 8 uds',9.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(31,2,'Tostones playeros 3 uds',7.99,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(32,2,'Nuggets 250 gr aprox.',6.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(33,2,'Croquetas 8 uds',6.99,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(34,2,'Chorizos 3 uds + yuca',12.99,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(35,2,'Morcillas 3 uds + yuca',12.99,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(36,2,'Morcillas 3 + chorizo 3 + yuca',15.99,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(37,2,'Ración chorizos 4 uds',9.99,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(38,2,'Ración morcillas 4 uds',9.99,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(39,2,'Ración de yuca',4.6,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(40,2,'Ración de patatas',3.6,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(41,2,'Ración de ensalada mixta o rallada',3.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(42,2,'Salchipapa',7.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(43,2,'Hallaquita',1.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(44,2,'Hallaquita mixta',2.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(45,2,'Alitas 8 uds',7.99,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(46,2,'Cochino frito + yuca',15.99,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(47,3,'Baguetín varios',5.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(48,3,'Baguetín oferta (martes y viernes)',4.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(49,3,'Pepito de pollo o carne',12.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(50,3,'Pepito mixto carne + pollo',16.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(51,3,'Pepito la Tía Rosa + patatas fritas',25.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(52,3,'Choripán',9.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(53,3,'Yumbo',6.8,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(54,3,'Bocadillo de milanesa de pollo',7.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(55,3,'Perro caliente clásico',2.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(56,3,'Perro caliente especial',5.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(57,3,'Hamburguesa sencilla',5.99,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(58,3,'Hamburguesa especial',10.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(59,3,'Hamburguesa mixta + patatas',12.99,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(60,3,'Hamburguesa trifásica + patatas',17.99,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(61,3,'Hamburguesa Tía Rosa + patatas',19.99,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(62,4,'1/2 pollo solo',6.99,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(63,4,'1 pollo solo',9.99,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(64,4,'Combo 1: 1/2 pollo + yuca/patatas/hallaquitas',10.6,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(65,4,'Combo 2: 1/2 pollo + yuca/patatas/hallaquitas + ensaladas',12.6,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(66,4,'Combo 3: 1 pollo + yuca/patatas/hallaquitas',15.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(67,4,'Combo 4: 1 pollo + yuca/patatas/hallaquitas + ensaladas',19.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(68,4,'Combo infantil: nuggets/croquetas + patatas',9.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(69,4,'Combo familiar: 2 pollos + yuca/patatas + alitas + ensaladas + Coca Cola 2L',42.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(70,4,'Combo caraqueños: 1 pollo + yuca/hallaquita + ensaladas + 6 cervezas',28.99,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(71,4,'Combo la Tía Rosa completo',46.9,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(72,4,'Pica pollo + tostones + ensaladas',20.99,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(73,4,'Picada colombiana 2 personas',35.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(74,4,'Parrilla mixta 1 persona',25.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(75,4,'Parrilla mixta 2 personas + 2 bebidas',55.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(76,4,'Cochino frito estilo Junquito 2 personas + 2 bebidas',35.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(77,5,'Sopas varias (solo domingos) + arepa/casabe/pan + bebida',17.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(78,5,'Pa''la Guaira: pescado frito + tostones + ensalada',18.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(79,5,'Cachapa con queso',12.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(80,5,'Cachapa con jamón y queso',13.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(81,5,'Cachapa con jamón, queso + cochino frito',16.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(82,5,'Cachapa la Tía Rosa',19.99,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(83,5,'Platos combinados (filete/pollo/lomo) + patatas + huevo + bebida',12.99,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(84,5,'Patacón',9.99,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(85,5,'Patacón mixto: carne mechada + pollo',13.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(86,5,'Patacón la Tía Rosa: carne mechada + pollo + cochino + chorizo + bebida',19.99,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(87,5,'Volcán de marisco 2 personas + papelón o cerveza',35.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(88,5,'Volcán de marisco Tía Rosa + papelón o cerveza',60.0,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(89,6,'Golfeado con queso',4.8,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(90,6,'Golfeado con queso de mano',5.9,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(91,6,'Torta 3 Leches',5.9,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(92,6,'Torta Maracuyá',4.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(93,6,'Torta de Guanábana',5.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(94,6,'Torta con Quesillo',5.5,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(95,6,'Quesillo',4.8,10.0,'comida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(96,7,'Coca Cola / Fanta / Acuarios',1.5,21.0,'bebida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(97,7,'Malta Polar Bot.',1.8,21.0,'bebida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(98,7,'Malta Polar Lata',2.5,21.0,'bebida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(99,7,'Pony Malta',2.5,21.0,'bebida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(100,7,'Frescolita 2 litros',5.99,21.0,'bebida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(101,7,'Frescolita Uva Lata',2.6,21.0,'bebida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(102,7,'Chicha / Choco Malt',3.5,21.0,'bebida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(103,7,'Jugo Naturales en Agua',3.8,21.0,'bebida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(104,7,'Jugo Naturales en Leche',4.5,21.0,'bebida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(105,7,'Papelón con Limón',2.5,21.0,'bebida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(106,7,'Cerveza Club Colombia',2.8,21.0,'bebida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(107,7,'Cerveza Caraqueña / Mahuo',1.5,21.0,'bebida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(108,7,'Cerveza Polar Lata / Premium',1.8,21.0,'bebida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(109,7,'Smirnoff / Breezer',3.5,21.0,'bebida',1,'2026-03-03 01:09:14');
INSERT INTO "productos" VALUES(110,7,'Voka Ice / Tom Ron',2.5,21.0,'bebida',1,'2026-03-03 01:09:14');
CREATE INDEX idx_productos_tipo     ON productos(tipo);
CREATE INDEX idx_productos_activo   ON productos(activo);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
DELETE FROM "sqlite_sequence";
INSERT INTO "sqlite_sequence" VALUES('categorias',7);
INSERT INTO "sqlite_sequence" VALUES('productos',110);
COMMIT;
