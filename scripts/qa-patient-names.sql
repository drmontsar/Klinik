-- Replace placeholder names in the fictional QA dataset; does not alter other patients.
UPDATE clinical.patients AS patient
SET name = names.name
FROM (VALUES
  ('Patient 100002', 'Aditi Malhotra'),
  ('Patient 100003', 'Dev Kapoor'),
  ('Patient 100004', 'Riya Khanna'),
  ('Patient 100005', 'Ishan Mehta'),
  ('Patient 100006', 'Anjali Sethi'),
  ('Patient 100007', 'Kavya Menon'),
  ('Patient 100008', 'Siddharth Jain'),
  ('Patient 100009', 'Anika Pillai'),
  ('Patient 100010', 'Vivek Bhatia'),
  ('Patient 100011', 'Neha Choudhury'),
  ('Patient 100012', 'Aditya Reddy'),
  ('Patient 100013', 'Pallavi Ghosh'),
  ('Patient 100014', 'Naveen Prasad'),
  ('Patient 100015', 'Shalini Nambiar'),
  ('Patient 100016', 'Rakesh Bansal'),
  ('Patient 100017', 'Ayesha Mirza'),
  ('Patient 100018', 'Pranav Kulkarni'),
  ('Patient 100019', 'Swati Tripathi'),
  ('Patient 100020', 'Gaurav Tiwari'),
  ('Patient 100021', 'Karthik Srinivasan'),
  ('Patient 100022', 'Manish Vora'),
  ('Patient 100024', 'Anjali Chatterjee'),
  ('Patient 100026', 'Deepak Sood'),
  ('Patient 100028', 'Ritu Saxena')
) AS names(old_name, name)
WHERE patient.name = names.old_name;

UPDATE staff.users SET name = 'Dr. Sameer Rao'
WHERE id = '11000000-0000-4000-8000-000000000007' AND name = 'Bruce Wayne';
UPDATE staff.user_credentials SET email = 'sameer+rao@klinik.com'
WHERE user_id = '11000000-0000-4000-8000-000000000007' AND email = 'bruce+wayne@klinik.com';
