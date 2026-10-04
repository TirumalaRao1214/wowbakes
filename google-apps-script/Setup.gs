/**
 * WOW BAKES — Google Sheet Auto-Setup Script
 * File: Setup.gs
 *
 * This script creates and populates the entire Google Sheet automatically.
 * Run it ONCE after pasting into Apps Script.
 *
 * What it does:
 *   1. Creates (or resets) sheets: Products, AddOns, Categories
 *   2. Adds all column headers
 *   3. Pre-fills all 97 WOW BAKES products with correct prices
 *   4. Pre-fills all 11 categories
 *   5. Pre-fills all 9 add-ons
 *   6. Applies basic formatting (bold headers, freeze row 1)
 *
 * HOW TO RUN:
 *   1. Open your Google Sheet → Extensions → Apps Script
 *   2. Create a new file: File → New → Script file → name it "Setup"
 *   3. Paste this entire file
 *   4. Select function "setupWowBakes" from the dropdown
 *   5. Click ▶ Run
 *   6. Grant permissions when asked
 *   7. Done! Check your Google Sheet.
 */


// ─────────────────────────────────────────────────────────────────────────────
// MAIN SETUP FUNCTION — Run this once
// ─────────────────────────────────────────────────────────────────────────────

function setupWowBakes() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('Starting WOW BAKES setup on: ' + ss.getName());

  _setupCategories(ss);
  _setupAddOns(ss);
  _setupProducts(ss);

  // Show success alert
  SpreadsheetApp.getUi().alert(
    '✅ WOW BAKES Setup Complete!\n\n' +
    '✔ Categories sheet: 11 categories added\n' +
    '✔ AddOns sheet: 9 add-ons added\n' +
    '✔ Products sheet: 97 products added\n\n' +
    'Next step: Deploy your Apps Script as a Web App\n' +
    'then update API_URL in js/config.js'
  );

  Logger.log('Setup complete!');
}


// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES SHEET
// ─────────────────────────────────────────────────────────────────────────────

function _setupCategories(ss) {
  var sheet = _getOrCreateSheet(ss, 'Categories');
  sheet.clearContents();

  var headers = ['CategoryID', 'CategoryName', 'Emoji', 'ImageURL', 'DisplayOrder', 'Active'];

  var data = [
    ['cat-01', 'Burgers',             '🍔', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', 1,  'YES'],
    ['cat-02', 'Pizza',               '🍕', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80', 2,  'YES'],
    ['cat-03', 'Pasta',               '🍝', 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600&auto=format&fit=crop&q=80', 3,  'YES'],
    ['cat-04', 'Nachos',              '🫙', 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&auto=format&fit=crop&q=80', 4,  'YES'],
    ['cat-05', 'Fries & Garlic Bread','🍟', 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80', 5,  'YES'],
    ['cat-06', 'Between the Breads',  '🥪', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80', 6,  'YES'],
    ['cat-07', 'Starters',            '🥗', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80', 7,  'YES'],
    ['cat-08', 'Momos',               '🥟', 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80', 8,  'YES'],
    ['cat-09', 'Main Course',         '🍛', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80', 9,  'YES'],
    ['cat-10', 'Milkshakes',          '🥛', 'https://images.unsplash.com/photo-1546039907-7fa05f864c02?w=600&auto=format&fit=crop&q=80', 10, 'YES'],
    ['cat-11', 'Thickshakes',         '🧋', 'https://images.unsplash.com/photo-1572490122747-3e9e12a58b84?w=600&auto=format&fit=crop&q=80', 11, 'YES'],
  ];

  _writeSheet(sheet, headers, data);
  Logger.log('Categories: ' + data.length + ' rows written');
}


// ─────────────────────────────────────────────────────────────────────────────
// ADDONS SHEET
// ─────────────────────────────────────────────────────────────────────────────

function _setupAddOns(ss) {
  var sheet = _getOrCreateSheet(ss, 'AddOns');
  sheet.clearContents();

  var headers = ['AddOnID', 'Category', 'AddOnName', 'Price', 'Available'];

  var data = [
    ['ao-001', 'Burgers',            'Extra Cheese',        30, 'YES'],
    ['ao-002', 'Burgers',            'Extra Patty',         40, 'YES'],
    ['ao-003', 'Pizza',              'Regular Veggies',     20, 'YES'],
    ['ao-004', 'Pizza',              'Extra Veggies',       30, 'YES'],
    ['ao-005', 'Pizza',              'Extra Cheese',        40, 'YES'],
    ['ao-006', 'Pasta',              'Garlic Bread - 2 Pcs',49, 'YES'],
    ['ao-007', 'Between the Breads', 'Extra Cheese',        30, 'YES'],
    ['ao-008', 'Starters',           'Extra Sauce',         20, 'YES'],
    ['ao-009', 'Main Course',        'Extra Portion',       50, 'YES'],
  ];

  _writeSheet(sheet, headers, data);
  Logger.log('AddOns: ' + data.length + ' rows written');
}


// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS SHEET
// ─────────────────────────────────────────────────────────────────────────────

function _setupProducts(ss) {
  var sheet = _getOrCreateSheet(ss, 'Products');
  sheet.clearContents();

  var headers = [
    'ProductID','ProductName','Category','SubCategory','Description',
    'Price','OfferPrice','VariantType','VariantName',
    'JainAvailable','SpicyLevel','Available','Featured','ImageURL','DisplayOrder'
  ];

  // IMG shortcuts
  var IMG = {
    burger:  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    pizza:   'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80',
    pasta:   'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600&auto=format&fit=crop&q=80',
    nachos:  'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&auto=format&fit=crop&q=80',
    fries:   'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80',
    sandwich:'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80',
    starter: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    momos:   'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80',
    rice:    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
    shake:   'https://images.unsplash.com/photo-1546039907-7fa05f864c02?w=600&auto=format&fit=crop&q=80',
    thick:   'https://images.unsplash.com/photo-1572490122747-3e9e12a58b84?w=600&auto=format&fit=crop&q=80',
  };

  // Columns: ProductID | ProductName | Category | SubCategory | Description | Price | OfferPrice | VariantType | VariantName | JainAvailable | SpicyLevel | Available | Featured | ImageURL | DisplayOrder
  var data = [

    // ── BURGERS ─────────────────────────────────────────────────────────────
    ['B001','Veggie Burger',              'Burgers','Classic Burgers', 'Classic veggie patty with fresh lettuce, tomato and our signature sauce',         129,'','Single',     'Regular','YES',0,'YES','YES',IMG.burger,1],
    ['B002','Tandoori Veggie Burger',     'Burgers','Classic Burgers', 'Tandoori spiced veggie patty with mint chutney and crisp vegetables',             149,'','Single',     'Regular','NO', 1,'YES','NO', IMG.burger,2],
    ['B003','Paneer Burger',              'Burgers','Paneer Burgers',  'Soft paneer patty with fresh veggies and creamy sauce in a toasted bun',          149,'','Single',     'Regular','YES',0,'YES','YES',IMG.burger,3],
    ['B004','Tandoori Paneer Burger',     'Burgers','Paneer Burgers',  'Tandoori-marinated paneer patty with green chutney and fresh salad',              169,'','Single',     'Regular','NO', 1,'YES','NO', IMG.burger,4],
    ['B005','Paneer Tikka Burger',        'Burgers','Paneer Burgers',  'Flavorful paneer tikka with caramelized onions and tandoori sauce',               179,'','Single',     'Regular','NO', 2,'YES','YES',IMG.burger,5],
    ['B006','Potato Cheese Blast Burger', 'Burgers','Special Burgers', 'Double cheese with crispy potato patty — an explosion of flavor',                 189,'','Single',     'Regular','NO', 0,'YES','YES',IMG.burger,6],
    ['B007','Double Patty Mega Burger',   'Burgers','Special Burgers', 'Double stacked patty burger — for the serious hunger',                            219,'','Single',     'Regular','NO', 1,'YES','YES',IMG.burger,7],
    ['B008','Burger + Fries + Coke Combo','Burgers','Combos',          'Any regular burger with crispy fries and chilled Coke',                           229,'','Single',     'Regular','NO', 0,'YES','NO', IMG.burger,8],

    // ── PIZZA ───────────────────────────────────────────────────────────────
    ['P001','Margherita Pizza',       'Pizza','Classic', 'Classic mozzarella and tomato base with fresh basil',                    179,'','Size','Regular (7")','YES',0,'YES','YES',IMG.pizza,9],
    ['P001','Margherita Pizza',       'Pizza','Classic', 'Classic mozzarella and tomato base with fresh basil',                    249,'','Size','Medium (9")', 'YES',0,'YES','YES',IMG.pizza,9],
    ['P002','Golden Corn Pizza',      'Pizza','Classic', 'Sweet golden corn with mozzarella on a rich tomato base',               189,'','Size','Regular (7")','YES',0,'YES','NO', IMG.pizza,10],
    ['P002','Golden Corn Pizza',      'Pizza','Classic', 'Sweet golden corn with mozzarella on a rich tomato base',               259,'','Size','Medium (9")', 'YES',0,'YES','NO', IMG.pizza,10],
    ['P003','Marmia Italian Pizza',   'Pizza','Classic', 'Italian herbs, olives and vegetables on a rich pizza base',             199,'','Size','Regular (7")','YES',0,'YES','NO', IMG.pizza,11],
    ['P003','Marmia Italian Pizza',   'Pizza','Classic', 'Italian herbs, olives and vegetables on a rich pizza base',             269,'','Size','Medium (9")', 'YES',0,'YES','NO', IMG.pizza,11],
    ['P004','Veg Fiesta Pizza',       'Pizza','Premium', 'A fiesta of colourful vegetables and melted cheese',                    209,'','Size','Regular (7")','YES',1,'YES','YES',IMG.pizza,12],
    ['P004','Veg Fiesta Pizza',       'Pizza','Premium', 'A fiesta of colourful vegetables and melted cheese',                    279,'','Size','Medium (9")', 'YES',1,'YES','YES',IMG.pizza,12],
    ['P005','Veggie Lover Pizza',     'Pizza','Premium', 'Loaded with premium garden vegetables and extra mozzarella',            219,'','Size','Regular (7")','YES',0,'YES','NO', IMG.pizza,13],
    ['P005','Veggie Lover Pizza',     'Pizza','Premium', 'Loaded with premium garden vegetables and extra mozzarella',            289,'','Size','Medium (9")', 'YES',0,'YES','NO', IMG.pizza,13],
    ['P006','Peppy Paneer Pizza',     'Pizza','Premium', 'Spiced paneer cubes with capsicum and tangy pizza sauce',               229,'','Size','Regular (7")','NO', 2,'YES','YES',IMG.pizza,14],
    ['P006','Peppy Paneer Pizza',     'Pizza','Premium', 'Spiced paneer cubes with capsicum and tangy pizza sauce',               299,'','Size','Medium (9")', 'NO', 2,'YES','YES',IMG.pizza,14],
    ['P007','Indo Masala Paneer Pizza','Pizza','Premium','Desi twist on pizza with masala-marinated paneer and Indian spices',    239,'','Size','Regular (7")','NO', 2,'YES','NO', IMG.pizza,15],
    ['P007','Indo Masala Paneer Pizza','Pizza','Premium','Desi twist on pizza with masala-marinated paneer and Indian spices',    309,'','Size','Medium (9")', 'NO', 2,'YES','NO', IMG.pizza,15],

    // ── PASTA ───────────────────────────────────────────────────────────────
    ['PA001','Arrabbiata Pasta',   'Pasta','Classic','Classic Italian pasta in spicy tomato arrabbiata sauce', 159,'','Single','Regular','NO', 2,'YES','NO', IMG.pasta,16],
    ['PA002','Alfred Pasta',       'Pasta','Creamy', 'Rich and creamy Alfredo sauce with mushrooms and herbs',169,'','Single','Regular','NO', 0,'YES','NO', IMG.pasta,17],
    ['PA003','Tomato Cream Pasta', 'Pasta','Creamy', 'Pasta in a rich tomato cream sauce with Italian herbs', 169,'','Single','Regular','NO', 1,'YES','NO', IMG.pasta,18],

    // ── NACHOS ──────────────────────────────────────────────────────────────
    ['NA001','Nachos with Cheese','Nachos','Classic', 'Crispy nachos smothered in warm melted cheese sauce',                139,'','Single','Regular','YES',0,'YES','NO', IMG.nachos,19],
    ['NA002','Grand Nachos',      'Nachos','Premium', 'Loaded nachos with cheese sauce, jalapeños, salsa and sour cream',  179,'','Single','Regular','NO', 1,'YES','YES',IMG.nachos,20],

    // ── FRIES & GARLIC BREAD ────────────────────────────────────────────────
    ['F001','Classic Salted French Fries','Fries & Garlic Bread','Fries',       'Golden crispy fries with sea salt',                               89, '','Single',     'Regular','YES',0,'YES','NO', IMG.fries,21],
    ['F002','Cheesy French Fries',        'Fries & Garlic Bread','Fries',       'Crispy fries topped with generous melted cheese sauce',           119,'','Single',     'Regular','YES',0,'YES','NO', IMG.fries,22],
    ['F003','Peri Peri French Fries',     'Fries & Garlic Bread','Fries',       'Fries tossed in fiery peri peri spice blend',                     109,'','Single',     'Regular','NO', 2,'YES','NO', IMG.fries,23],
    ['F004','Herbed Potato Wedges',       'Fries & Garlic Bread','Fries',       'Thick-cut potato wedges seasoned with mixed herbs',               109,'','Single',     'Regular','YES',0,'YES','NO', IMG.fries,24],
    ['F005','Pizza French Fries',         'Fries & Garlic Bread','Fries',       'Fries loaded with pizza sauce and cheese',                        129,'','Single',     'Regular','YES',0,'YES','NO', IMG.fries,25],
    ['F006','Garlic Bread',               'Fries & Garlic Bread','Garlic Bread','Toasted bread with garlic butter spread',                          79,'','Quantity',   '2 Pcs',  'YES',0,'YES','NO', IMG.fries,26],
    ['F006','Garlic Bread',               'Fries & Garlic Bread','Garlic Bread','Toasted bread with garlic butter spread',                         149,'','Quantity',   '4 Pcs',  'YES',0,'YES','NO', IMG.fries,26],

    // ── BETWEEN THE BREADS ──────────────────────────────────────────────────
    ['BTB001','Spicy BBQ Sandwich',        'Between the Breads','Grilled Sandwiches','Toasted sandwich with smoky BBQ sauce and fresh veggies',             119,'','Single','Regular','NO', 2,'YES','NO', IMG.sandwich,27],
    ['BTB002','Pizza Sandwich',            'Between the Breads','Grilled Sandwiches','Grilled sandwich filled with pizza sauce, cheese and veggies',         119,'','Single','Regular','YES',0,'YES','NO', IMG.sandwich,28],
    ['BTB003','Veg Mayonnaise Grilled',    'Between the Breads','Grilled Sandwiches','Grilled sandwich with veggies and creamy mayo',                        109,'','Single','Regular','YES',0,'YES','NO', IMG.sandwich,29],
    ['BTB004','Mumbai Se Aaya Mera Toast', 'Between the Breads','Toast',            'Bombay-style masala toast with green chutney and butter',               129,'','Single','Regular','YES',1,'YES','YES',IMG.sandwich,30],
    ['BTB005','Veg Grilled Sandwich',      'Between the Breads','Grilled Sandwiches','Classic grilled sandwich with mixed veggies',                           99,'','Single','Regular','YES',0,'YES','NO', IMG.sandwich,31],
    ['BTB006','Cheese and Chilly Toast',   'Between the Breads','Toast',            'Crispy toast with melted cheese and green chillies',                    119,'','Single','Regular','YES',1,'YES','NO', IMG.sandwich,32],
    ['BTB007','Paneer Toast',              'Between the Breads','Paneer Specials',   'Toasted bread with spiced paneer filling',                              129,'','Single','Regular','YES',1,'YES','NO', IMG.sandwich,33],
    ['BTB008','Classic Paneer Sandwich',   'Between the Breads','Paneer Specials',   'Fresh paneer with crisp salad in a soft sandwich',                      139,'','Single','Regular','YES',0,'YES','NO', IMG.sandwich,34],
    ['BTB009','Peri Peri Paneer Sandwich', 'Between the Breads','Paneer Specials',   'Fiery peri peri paneer in a grilled sandwich',                          149,'','Single','Regular','NO', 2,'YES','NO', IMG.sandwich,35],
    ['BTB010','Tandoori Paneer Sandwich',  'Between the Breads','Paneer Specials',   'Tandoori marinated paneer in toasted bread with mint chutney',           159,'','Single','Regular','NO', 1,'YES','NO', IMG.sandwich,36],
    ['BTB011','Cheese Paneer Sandwich',    'Between the Breads','Paneer Specials',   'Paneer and cheese loaded toasted sandwich',                              149,'','Single','Regular','YES',0,'YES','NO', IMG.sandwich,37],
    ['BTB012','Schezwan Grilled Paneer',   'Between the Breads','Paneer Specials',   'Schezwan-spiced paneer grilled in a toasted sandwich',                   159,'','Single','Regular','NO', 2,'YES','NO', IMG.sandwich,38],
    ['BTB013','Paneer Chilli',             'Between the Breads','Starters',          'Paneer tossed in chilli garlic sauce — dry style',                       169,'','Single','Regular','NO', 2,'YES','NO', IMG.sandwich,39],
    ['BTB014','Coleslaw',                  'Between the Breads','Sides',             'Fresh creamy coleslaw with shredded cabbage and carrots',                 79,'','Single','Regular','YES',0,'YES','NO', IMG.sandwich,40],

    // ── STARTERS ────────────────────────────────────────────────────────────
    ['S001','Plain Papad',                'Starters','Papads',           'Crispy roasted papad — plain and simple',                              30, '','Single',     'Regular','YES',0,'YES','NO', IMG.starter,41],
    ['S002','Masala Papad',               'Starters','Papads',           'Crispy papad topped with onion, tomato, coriander and spices',         49, '','Single',     'Regular','NO', 1,'YES','NO', IMG.starter,42],
    ['S003','Corn Samosa',                'Starters','Samosas',          'Crispy golden samosa filled with spiced sweet corn',                    59, '','Quantity',   '2 Pcs',  'YES',1,'YES','NO', IMG.starter,43],
    ['S004','Punjabi Samosa',             'Starters','Samosas',          'Classic large Punjabi samosa with spiced potato and peas',              49, '','Quantity',   '2 Pcs',  'YES',1,'YES','NO', IMG.starter,44],
    ['S005','Veg Spring Rolls',           'Starters','Spring Rolls',     'Crispy rolls stuffed with seasoned vegetables',                         99, '','Quantity',   '4 Pcs',  'YES',1,'YES','NO', IMG.starter,45],
    ['S006','Corn Spring Rolls',          'Starters','Spring Rolls',     'Crispy spring rolls filled with sweet corn and cheese',                109, '','Quantity',   '4 Pcs',  'YES',0,'YES','NO', IMG.starter,46],
    ['S007','Smileys',                    'Starters','Potato Items',     'Smiley-face potato snacks — golden and crispy',                         99, '','Single',     'Regular','YES',0,'YES','NO', IMG.starter,47],
    ['S008','Onion Rings',                'Starters','Potato Items',     'Golden battered onion rings — crispy outside, tender inside',          109, '','Single',     'Regular','NO', 0,'YES','NO', IMG.starter,48],
    ['S009','Pizza Pockets',              'Starters','Cheese Items',     'Pockets stuffed with pizza sauce and melted mozzarella',               119, '','Single',     'Regular','YES',0,'YES','NO', IMG.starter,49],
    ['S010','Potato Cheese Shots',        'Starters','Cheese Items',     'Crispy potato bites oozing with melted cheese',                        119, '','Single',     'Regular','YES',0,'YES','YES',IMG.starter,50],
    ['S011','Cheese Corn Balls',          'Starters','Cheese Items',     'Golden balls of corn and cheese with a crispy coating',                129, '','Single',     'Regular','YES',0,'YES','NO', IMG.starter,51],
    ['S012','Hot Cheesy Vegetable Logs',  'Starters','Cheese Items',     'Crispy vegetable logs filled with spiced veggies and cheese',          139, '','Single',     'Regular','YES',1,'YES','NO', IMG.starter,52],
    ['S013','Crispy Corn',                'Starters','Chinese Starters', 'Golden crispy corn kernels tossed in seasoning',                       109, '','Single',     'Regular','YES',0,'YES','NO', IMG.starter,53],
    ['S014','Chilli Potato',              'Starters','Chinese Starters', 'Crispy potatoes tossed in tangy chilli sauce',                         129, '','Single',     'Regular','NO', 2,'YES','NO', IMG.starter,54],
    ['S015','Honey Chilli Potato',        'Starters','Chinese Starters', 'Crispy potatoes glazed with sweet honey chilli sauce',                 139, '','Single',     'Regular','NO', 1,'YES','YES',IMG.starter,55],
    ['S016','Baby Corn Manchurian',       'Starters','Chinese Starters', 'Baby corn in tangy Manchurian sauce',                                  149, '','Preparation','Dry',     'NO', 1,'YES','NO', IMG.starter,56],
    ['S016','Baby Corn Manchurian',       'Starters','Chinese Starters', 'Baby corn in tangy Manchurian sauce',                                  149, '','Preparation','Wet',     'NO', 1,'YES','NO', IMG.starter,56],
    ['S017','Manchurian',                 'Starters','Chinese Starters', 'Classic veg balls in spicy Manchurian sauce',                          149, '','Preparation','Dry',     'NO', 2,'YES','NO', IMG.starter,57],
    ['S017','Manchurian',                 'Starters','Chinese Starters', 'Classic veg balls in spicy Manchurian sauce',                          149, '','Preparation','Wet',     'NO', 2,'YES','NO', IMG.starter,57],
    ['S018','Paneer Chilly',              'Starters','Chinese Starters', 'Soft paneer cubes tossed in fiery chilli sauce',                       169, '','Preparation','Dry',     'NO', 2,'YES','NO', IMG.starter,58],
    ['S018','Paneer Chilly',              'Starters','Chinese Starters', 'Soft paneer cubes tossed in fiery chilli sauce',                       169, '','Preparation','Wet',     'NO', 2,'YES','NO', IMG.starter,58],
    ['S019','Chilli Babycorn',            'Starters','Chinese Starters', 'Crunchy baby corn in chilli sauce',                                    149, '','Single',     'Regular','NO', 2,'YES','NO', IMG.starter,59],
    ['S020','Veg 65',                     'Starters','Indian Starters',  'Spicy crispy veg 65 — a South Indian classic',                         139, '','Single',     'Regular','NO', 2,'YES','NO', IMG.starter,60],
    ['S021','Indo Chinese Paneer Chilly', 'Starters','Chinese Starters', 'Paneer in Indo-Chinese style chilli sauce with bell peppers',           179, '','Single',     'Regular','NO', 2,'YES','NO', IMG.starter,61],
    ['S022','Barbecue Paneer Satay',      'Starters','Indian Starters',  'Grilled paneer skewers with smoky BBQ marinade',                       179, '','Single',     'Regular','NO', 1,'YES','YES',IMG.starter,62],
    ['S023','Paneer 65',                  'Starters','Indian Starters',  'Crispy spiced paneer 65 — bold flavours',                              169, '','Single',     'Regular','NO', 2,'YES','NO', IMG.starter,63],
    ['S024','Paneer Majestic',            'Starters','Indian Starters',  'Paneer majestic — a Hyderabadi favourite with spicy masala coating',   179, '','Single',     'Regular','NO', 2,'YES','YES',IMG.starter,64],

    // ── MOMOS ───────────────────────────────────────────────────────────────
    ['M001','Veg Fried Momos',   'Momos','Veg Momos',   'Delicious 6-piece veg momos — choose steamed or fried with chilli dip',           149,'','Preparation','Steamed','NO',1,'YES','YES',IMG.momos,65],
    ['M001','Veg Fried Momos',   'Momos','Veg Momos',   'Delicious 6-piece veg momos — choose steamed or fried with chilli dip',           159,'','Preparation','Fried',  'NO',1,'YES','YES',IMG.momos,65],
    ['M002','Paneer Fried Momos','Momos','Paneer Momos', 'Premium 6-piece paneer momos — choose steamed or fried with chilli dip',          159,'','Preparation','Steamed','NO',1,'YES','NO', IMG.momos,66],
    ['M002','Paneer Fried Momos','Momos','Paneer Momos', 'Premium 6-piece paneer momos — choose steamed or fried with chilli dip',          169,'','Preparation','Fried',  'NO',1,'YES','NO', IMG.momos,66],

    // ── MAIN COURSE — NOODLES ───────────────────────────────────────────────
    ['MC001','Hakka Noodles',           'Main Course','Noodles','Classic wok-tossed Hakka noodles with vegetables',                    149,'','Single','Regular','NO',1,'YES','NO', IMG.rice,67],
    ['MC002','Spl. Veg Noodles',        'Main Course','Noodles','Special veg noodles with premium vegetables and sauces',              159,'','Single','Regular','NO',1,'YES','NO', IMG.rice,68],
    ['MC003','Schezwan Noodles',        'Main Course','Noodles','Spicy schezwan sauce noodles with fresh vegetables',                  159,'','Single','Regular','NO',2,'YES','YES',IMG.rice,69],
    ['MC004','Paneer Noodles',          'Main Course','Noodles','Noodles with soft paneer cubes and sauces',                          169,'','Single','Regular','NO',1,'YES','NO', IMG.rice,70],
    ['MC005','Chilly Garlic Noodles',   'Main Course','Noodles','Noodles tossed in fiery chilly garlic sauce',                        159,'','Single','Regular','NO',2,'YES','NO', IMG.rice,71],
    ['MC006','Schezwan Paneer Noodles', 'Main Course','Noodles','Spicy schezwan noodles with paneer and vegetables',                  179,'','Single','Regular','NO',2,'YES','NO', IMG.rice,72],
    ['MC007','Thai Chilly Basil Noodles','Main Course','Noodles','Thai-style noodles with fresh basil and chilli',                    169,'','Single','Regular','NO',2,'YES','NO', IMG.rice,73],
    ['MC008','Singapore Noodles',       'Main Course','Noodles','Singapore-style noodles with curry powder and vegetables',           169,'','Single','Regular','NO',1,'YES','NO', IMG.rice,74],

    // ── MAIN COURSE — RICE ──────────────────────────────────────────────────
    ['MC009','Jeera Rice',                    'Main Course','Rice','Fragrant basmati rice tempered with cumin',                            99, '','Single','Regular','YES',0,'YES','NO', IMG.rice,75],
    ['MC010','Pudina Rice',                   'Main Course','Rice','Aromatic mint-flavoured basmati rice',                                109, '','Single','Regular','YES',0,'YES','NO', IMG.rice,76],
    ['MC011','Fried Rice',                    'Main Course','Rice','Wok-tossed veg fried rice with soy sauce',                            139, '','Single','Regular','NO', 0,'YES','NO', IMG.rice,77],
    ['MC012','Schezwan Fried Rice',           'Main Course','Rice','Spicy schezwan fried rice — bold and flavorful',                      149, '','Single','Regular','NO', 2,'YES','YES',IMG.rice,78],
    ['MC013','Paneer Fried Rice',             'Main Course','Rice','Fried rice with paneer cubes and vegetables',                         159, '','Single','Regular','NO', 0,'YES','NO', IMG.rice,79],
    ['MC014','Spl. Veg Fried Rice',           'Main Course','Rice','Special fried rice with a premium mix of vegetables',                 159, '','Single','Regular','NO', 0,'YES','NO', IMG.rice,80],
    ['MC015','Schezwan Paneer Fried Rice',    'Main Course','Rice','Schezwan fried rice with tender paneer pieces',                       169, '','Single','Regular','NO', 2,'YES','NO', IMG.rice,81],
    ['MC016','Cashew Fried Rice',             'Main Course','Rice','Fried rice with roasted cashews and vegetables',                      169, '','Single','Regular','NO', 0,'YES','NO', IMG.rice,82],
    ['MC017','Corn & Capsicum Fried Rice',    'Main Course','Rice','Fried rice with sweet corn and colourful capsicum',                   159, '','Single','Regular','NO', 0,'YES','NO', IMG.rice,83],
    ['MC018','Thai Basil Chilly Fried Rice',  'Main Course','Rice','Thai-inspired fried rice with fragrant basil and chilli',             169, '','Single','Regular','NO', 2,'YES','NO', IMG.rice,84],
    ['MC019','SPL. Paneer Fried Rice',        'Main Course','Rice','Special paneer fried rice with premium ingredients',                  179, '','Single','Regular','NO', 0,'YES','NO', IMG.rice,85],
    ['MC020','SPL. Kaju Fried Rice',          'Main Course','Rice','Special cashew fried rice — rich and aromatic',                       179, '','Single','Regular','NO', 0,'YES','NO', IMG.rice,86],
    ['MC021','SPL. Kaju Paneer Fried Rice',   'Main Course','Rice','Special cashew and paneer fried rice — the premium choice',           199, '','Single','Regular','NO', 0,'YES','NO', IMG.rice,87],

    // ── MILKSHAKES ──────────────────────────────────────────────────────────
    ['SH001','Butterscotch Milkshake','Milkshakes','Classic Shakes', 'Creamy butterscotch milkshake with premium ice cream',         119,'','Single','Regular','YES',0,'YES','YES',IMG.shake,88],
    ['SH002','Strawberry Milkshake',  'Milkshakes','Classic Shakes', 'Fresh strawberry milkshake with real fruit',                   119,'','Single','Regular','YES',0,'YES','NO', IMG.shake,89],
    ['SH003','Oreo Milkshake',        'Milkshakes','Cookie Shakes',  'Rich milkshake blended with Oreo cookies and cream',           129,'','Single','Regular','YES',0,'YES','YES',IMG.shake,90],
    ['SH004','KitKat Milkshake',      'Milkshakes','Cookie Shakes',  'Decadent milkshake blended with KitKat chocolate wafer',       139,'','Single','Regular','YES',0,'YES','NO', IMG.shake,91],
    ['SH005','Brownie Milkshake',     'Milkshakes','Cookie Shakes',  'Luscious chocolate brownie milkshake — indulgent and rich',    149,'','Single','Regular','YES',0,'YES','NO', IMG.shake,92],

    // ── THICKSHAKES ─────────────────────────────────────────────────────────
    ['TS001','Butterscotch Thickshake','Thickshakes','Classic Thickshakes','Super thick and creamy butterscotch thickshake',            149,'','Single','Regular','YES',0,'YES','YES',IMG.thick,93],
    ['TS002','Strawberry Thickshake',  'Thickshakes','Classic Thickshakes','Super thick strawberry shake with real fruit purée',        149,'','Single','Regular','YES',0,'YES','NO', IMG.thick,94],
    ['TS003','Oreo Thickshake',        'Thickshakes','Cookie Thickshakes', 'Extra thick Oreo thickshake — loaded with cookie pieces',   159,'','Single','Regular','YES',0,'YES','YES',IMG.thick,95],
    ['TS004','KitKat Thickshake',      'Thickshakes','Cookie Thickshakes', 'Loaded KitKat thickshake — thick, creamy and chocolatey',   169,'','Single','Regular','YES',0,'YES','NO', IMG.thick,96],
    ['TS005','Brownie Thickshake',     'Thickshakes','Cookie Thickshakes', 'Thick indulgent brownie shake — the ultimate dessert drink', 179,'','Single','Regular','YES',0,'YES','NO', IMG.thick,97],

  ];

  _writeSheet(sheet, headers, data);
  Logger.log('Products: ' + data.length + ' rows written');
}


// ─────────────────────────────────────────────────────────────────────────────
// UTILITY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Gets an existing sheet by name, or creates it if it doesn't exist.
 */
function _getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    Logger.log('Created new sheet: ' + name);
  } else {
    Logger.log('Using existing sheet: ' + name);
  }
  return sheet;
}

/**
 * Writes headers + data rows to a sheet, formats headers bold,
 * freezes row 1, and auto-resizes columns.
 */
function _writeSheet(sheet, headers, rows) {
  // Write all at once (much faster than row-by-row)
  var allData = [headers].concat(rows);
  sheet.getRange(1, 1, allData.length, headers.length).setValues(allData);

  // Format header row: bold, background color, freeze
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#2C1810');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontSize(11);

  // Freeze header row
  sheet.setFrozenRows(1);

  // Auto-resize all columns
  for (var i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }

  // Alternate row banding for readability
  try {
    var dataRange = sheet.getRange(1, 1, allData.length, headers.length);
    var banding = dataRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
    banding.setHeaderRowColor('#2C1810');
    banding.setFirstRowColor('#FFFFFF');
    banding.setSecondRowColor('#FDF6EE');
  } catch(e) {
    // Banding already applied or not supported — ignore
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// RESET — Run this to wipe all data and re-run setup from scratch
// ─────────────────────────────────────────────────────────────────────────────

function resetAndSetup() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    '⚠️ Reset WOW BAKES Data',
    'This will DELETE all data in the Products, AddOns and Categories sheets and re-populate them from scratch.\n\nAre you sure?',
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    setupWowBakes();
  } else {
    ui.alert('Reset cancelled.');
  }
}
