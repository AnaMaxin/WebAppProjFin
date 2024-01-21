


CREATE TABLE app_user(
    app_user_id SERIAl PRIMARY KEY,
    first_name VARCHAR(20),
    last_name VARCHAR(20),
    email VARCHAR(60),
    username VARCHAR(40),
    password VARCHAR(100),
    date VARCHAR(100),
    profile_picture_path VARCHAR(60)
    
);


CREATE TABLE product(
    product_id SERIAL PRIMARY KEY,
    owner INT REFERENCES app_user(app_user_id),
    title VARCHAR(200),
    location VARCHAR(100),
    email_contact VARCHAR(50),
    phone_contact VARCHAR(20),
    price DECIMAL(10,2),
    currency VARCHAR(3),
    unit VARCHAR(10),
    quantity VARCHAR(100),
    description VARCHAR(5000),
    date VARCHAR(100),
    picture_path_0 VARCHAR(50),
    picture_path_1 VARCHAR(50),
    picture_path_2 VARCHAR(50)
);

CREATE TABLE conversation(
    conversation_id SERIAL PRIMARY KEY,
    participant1 INT REFERENCES app_user(app_user_id),
    participant2 INT REFERENCES app_user(app_user_id)
);


CREATE TABLE message(
    message_id SERIAL PRIMARY KEY,
    conversation INT REFERENCES conversation(conversation_id),
    sender INT REFERENCES app_user(app_user_id),
    receiver INT REFERENCES app_user(app_user_id),
    content TEXT,
    message_timestamp BIGINT,
    status VARCHAR(6) DEFAULT 'unread'
);





CREATE TABLE product_review(
    product_review_id SERIAL PRIMARY KEY,
    product INT REFERENCES product(product_id),
    reviewer INT REFERENCES app_user(app_user_id),
    review_timestamp BIGINT,
    content TEXT
);


CREATE TABLE customer_review(
    customer_review_id SERIAL PRIMARY KEY,
    customer INT REFERENCES app_user(app_user_id),
    reviewer INT REFERENCES app_user(app_user_id),
    review_timestamp BIGINT,
    content TEXT
);





