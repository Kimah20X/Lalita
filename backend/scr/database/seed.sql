------------------------------------------------------
-- 👩 SAMPLE USERS
------------------------------------------------------
insert into users (full_name, email, password, phone_number, language, role)
values
  ('Aisha Yakubu', 'aisha@example.com', '$2b$10$hashedpassword123', '08012345678', 'hausa', 'user'),
  ('Ngozi Peters', 'ngozi@example.com', '$2b$10$hashedpassword456', '08023456789', 'pidgin', 'user'),
  ('Grace Samuel', 'grace@example.com', '$2b$10$hashedpassword789', '08034567890', 'english', 'user')
on conflict do nothing;

------------------------------------------------------
-- 🧑‍💼 SAMPLE ADMIN
------------------------------------------------------
insert into admins (name, email, password)
values
  ('Lalita Admin', 'admin@lalita.ng', '$2b$10$hashedadminpass123')
on conflict do nothing;

------------------------------------------------------
-- 🎓 SAMPLE MENTORSHIP LESSONS
------------------------------------------------------
insert into mentorships (title, description, video_url, language, created_by)
values
  (
    'How to Manage Daily Sales',
    'Learn how to track daily sales and plan weekly profits.',
    'https://www.youtube.com/watch?v=dummylink1',
    'english',
    (select id from admins limit 1)
  ),
  (
    'Koyon Adana Kudi – Saving Made Simple',
    'Yadda za ki adana kudi don harkokin kasuwanci.',
    'https://www.youtube.com/watch?v=dummylink2',
    'hausa',
    (select id from admins limit 1)
  ),
  (
    'Business Etiquette in the Market',
    'Learn basic customer service and relationship skills.',
    'https://www.youtube.com/watch?v=dummylink3',
    'pidgin',
    (select id from admins limit 1)
  )
on conflict do nothing;

------------------------------------------------------
-- 💰 SAMPLE SAVINGS
------------------------------------------------------
insert into savings (user_id, amount, goal, status)
values
  ((select id from users where email = 'aisha@example.com'), 5000.00, 10000.00, 'active'),
  ((select id from users where email = 'ngozi@example.com'), 8000.00, 20000.00, 'active')
on conflict do nothing;

------------------------------------------------------
-- 💳 SAMPLE TRANSACTIONS
------------------------------------------------------
insert into transactions (user_id, amount, type, status, reference)
values
  ((select id from users where email = 'aisha@example.com'), 2000.00, 'deposit', 'success', 'TXN001'),
  ((select id from users where email = 'aisha@example.com'), 1000.00, 'withdrawal', 'success', 'TXN002'),
  ((select id from users where email = 'ngozi@example.com'), 3000.00, 'deposit', 'success', 'TXN003')
on conflict do nothing;

------------------------------------------------------
-- 💬 SAMPLE FEEDBACK
------------------------------------------------------
insert into feedback (user_id, mentorship_id, rating, comment)
values
  (
    (select id from users where email = 'grace@example.com'),
    (select id from mentorships where title = 'How to Manage Daily Sales'),
    5,
    'Very helpful and easy to understand!'
  ),
  (
    (select id from users where email = 'aisha@example.com'),
    (select id from mentorships where title = 'Koyon Adana Kudi – Saving Made Simple'),
    4,
    'Ina son wannan darasin sosai.'
  )
on conflict do nothing;
