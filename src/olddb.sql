CREATE DATABASE library;

CREATE TABLE book(
    acc_no VARCHAR(20) PRIMARY KEY,
    ref_no VARCHAR(10) NOT NULL,
    title VARCHAR(100) NOT NULL,
    pub_year INT,
    copies INT DEFAULT 1,
    edition_name VARCHAR(20),
);

CREATE TABLE author 
(  
    acc_no VARCHAR(20) PRIMARY KEY ,  
    author VARCHAR(30) NOT NULL, 
    FOREIGN KEY (acc_no) REFERENCES book(acc_no)
);

CREATE TABLE issues 
(  
    acc_no VARCHAR(20), 
    id VARCHAR(10) NOT NULL, 
    date_issued DATE NOT NULL, 
    due_date DATE NOT NULL,
    returned BOOLEAN,
    FOREIGN KEY(acc_no) REFERENCES book(acc_no), 
    FOREIGN KEY(id) REFERENCES employee(id)
);

CREATE TABLE book_record 
( 
    acc_no VARCHAR(20) PRIMARY KEY ,
    copies INT NOT NULL, 
    FOREIGN KEY(acc_no) REFERENCES book(acc_no)
);

create table department 
( 
    dept_id VARCHAR(10) PRIMARY KEY, 
    dept_name VARCHAR(10) NOT NULL, 
    building VARCHAR(10) NOT NULL, 
    salary FLOAT NOT NULL
);

CREATE TABLE employee 
( 
    id VARCHAR(10) PRIMARY KEY, 
    first_name VARCHAR(30) NOT NULL, 
    last_name VARCHAR(30), 
    email_personal VARCHAR(50), 
    email_work VARCHAR(50), 
    user_password VARCHAR(255) NOT NULL,
    dob DATE
);

CREATE TABLE security_info (
    login_id VARCHAR(10) PRIMARY KEY NOT NULL, 
    email VARCHAR(30) NOT NULL, 
    user_password VARCHAR(10) not null, 
    FOREIGN KEY(login_id) REFERENCES employee(id)
);

CREATE TABLE faculty
(  
    id VARCHAR(10) PRIMARY KEY ,  
    dept_id VARCHAR(10) not null, 
    FOREIGN KEY(dept_id) REFERENCES department(dept_id),
    FOREIGN KEY(id) REFERENCES employee(id)
);

CREATE TABLE librarian 
( 
    id VARCHAR(10) PRIMARY KEY,  
    level_lib VARCHAR(10) NOT NULL, 
    time_slot VARCHAR(10), 
    FOREIGN KEY(level_lib) REFERENCES lib_salary(level_lib), 
    FOREIGN KEY(id) REFERENCES employee(id)
);

CREATE TABLE lib_salary 
(
    level_lib VARCHAR(10) PRIMARY KEY ,  
    salary FLOAT NOT NULL
);


CREATE TABLE book_return 
(
    acc_no VARCHAR(20),
    due_date DATE,
    date_returned DATE, 
);