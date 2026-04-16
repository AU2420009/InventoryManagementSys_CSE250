-- Populate a new db with test data. We will initially start with this.

USE inventory_db;

START TRANSACTION;

INSERT INTO products (Product_ID, Name, Price, Quantity_Available)
VALUES
(1, 'Tomato 1Kg',23,560000),
(2, 'Potato 1Kg',25,300000),
(3, 'Chicken Breast',260,77000),
(4, 'Spinach 1Kg',37,846000),
(5, 'Butter 500g',20,22000),
(6, 'Atta 2Kg',92,23000)
;
INSERT INTO customers (Customer_ID, Name, Phone)
VALUES
(1, 'Ankit Kumar', '0123456789'),
(2, 'Milan Shah', '9876543210'),
(3, 'Anant Narayan', '0123498765'),
(4, 'Mayur Singh', '3482385973')
;


INSERT INTO orders (Order_ID, Customer_ID, Order_Date, Total_Amount)
VALUES
(1, 1, '2026-03-12', 4500),
(2, 3, '2026-03-21', 4900),
(3, 2, '2026-03-27', 1250)
;


INSERT INTO order_items(Order_ID, Product_ID, Quantity_Ordered, Price_At_Order_Time)
VALUES
(1, 5, 45, 20),
(1, 6, 40, 90),
(2, 1, 100, 23),
(2, 3, 10, 260),
(3, 2, 50, 25)
;

INSERT INTO Users (user_id, username, email, password_hash, role_id)
VALUES
('1', 'AU24220001', 'ankit.k@ahduni.edu.in', '380007', 1),
('2', 'AU24220002', 'milan.s@ahduni.edu.in', '380007', 1),
('3', 'AU24220003', 'anant.in@ahduni.edu.in', '380007', 1);

INSERT INTO Users (user_id, username, email, password_hash, role_id)
VALUES
('4', 'AU2420147', 'ankit97963@gmail.com', '380008', 2),
('5', 'AU2420148', 'prakash48204@gmail.com', '380008', 2),
('6', 'AU2420149', 'ankit97563@gmail.com', '380008', 2),
('7', 'AU2420150', 'ankit95663@gmail.com', '380008', 2);

INSERT INTO Users (user_id, username, email, password_hash, role_id)
VALUES
('8', 'AU2420151', 'hariramgeneralstores@gmail.com', '380009', 3);


COMMIT;
