-- Seed sample policyholders for SQL Server-backed development.
SET NOCOUNT ON;

INSERT INTO dbo.PolicyHolders
    (SSN, PolicyNumber, FirstName, LastName, DateOfBirth, ZipCode, Email, Phone)
SELECT
    seed.SSN,
    seed.PolicyNumber,
    seed.FirstName,
    seed.LastName,
    seed.DateOfBirth,
    seed.ZipCode,
    seed.Email,
    seed.Phone
FROM (VALUES
    ('6666', 'VA6666667', 'Chandler', 'Bing', '11/20/2024', '99501', 'chandler.bing@example.com', '9004008000'),
    ('7777', 'VA7788995', 'Joey', 'Tribbiani', '11/20/2024', '99501', 'joey.tribbiani@example.com', '9004008001'),
    ('8888', 'VA8899001', 'Muhammed', 'Shaan', '05/15/2002', '682001', 'muhammed.shaan@example.com', '9004008002'),
    ('9999', 'VA9900112', 'Rohit', 'S', '08/22/2001', '695001', 'rohit.s@example.com', '9004008003'),
    ('1234', 'VA1122334', 'Nahal', 'M', '03/10/2002', '695014', 'nahal.m@example.com', '9004008004'),
    ('2345', 'VA2233445', 'Arjun', 'Menon', '12/05/2000', '682016', 'arjun.menon@example.com', '9004008005'),
    ('3456', 'VA3344556', 'Aditya', 'Nair', '07/18/1999', '695033', 'aditya.nair@example.com', '9004008006'),
    ('4567', 'VA4455667', 'Rahul', 'Krishnan', '01/25/2001', '673001', 'rahul.krishnan@example.com', '9004008007'),
    ('5678', 'VA5566778', 'Ananya', 'Thomas', '09/12/2003', '682030', 'ananya.thomas@example.com', '9004008008'),
    ('6789', 'VA6677889', 'Vishnu', 'Kumar', '04/30/2000', '695004', 'vishnu.kumar@example.com', '9004008009')
) AS seed(SSN, PolicyNumber, FirstName, LastName, DateOfBirth, ZipCode, Email, Phone)
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.PolicyHolders AS existing
    WHERE existing.PolicyNumber = seed.PolicyNumber
);
