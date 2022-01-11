CREATE DATABASE library;

CREATE TABLE book(
    acc_no VARCHAR(20) PRIMARY KEY,
    ref_no VARCHAR(10) NOT NULL,
    title VARCHAR(100) NOT NULL,
    pub_year INT,
    edition_name VARCHAR(20),
);

CREATE TABLE author 
(  
    -- LETS JUST CONSIDER ONE AUTHOR BELONGS TO ONLY ONE BOOK
    id SERIAL PRIMARY KEY,
    acc_no VARCHAR(20),  
    author VARCHAR(30) NOT NULL, 
    FOREIGN KEY (acc_no) REFERENCES book(acc_no)
);


CREATE TABLE employee 
( 
    id VARCHAR(10) PRIMARY KEY, 
    first_name VARCHAR(30) NOT NULL, 
    last_name VARCHAR(30), 
    email VARCHAR(30), 
    is_librarian BOOLEAN DEFAULT FALSE,
    dob DATE
);

CREATE TABLE issues 
(  
    -- ONE ISSUE WILL BELONG ONLY TO ONE EMPLOYEE
    id VARCHAR(10) NOT NULL PRIMARY KEY, 
    acc_no VARCHAR(20)  , 
    date_issued DATE NOT NULL, 
    due_date DATE NOT NULL,
    date_returned DATE DEFAULT NULL,
    returned BOOLEAN DEFAULT FALSE, --TRUE OR FALSE
    FOREIGN KEY(acc_no) REFERENCES book(acc_no), 
    FOREIGN KEY(id) REFERENCES employee(id)
);


