-- Table: students
CREATE TABLE students (
    student_id   NUMBER(5) PRIMARY KEY,
    name         VARCHAR2(50),
    marks        NUMBER(5,2),
    grade        VARCHAR2(2)
);

-- Table: student_audit
CREATE TABLE student_audit (
    audit_id     NUMBER(5) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id   NUMBER(5),
    action_type  VARCHAR2(10),
    old_marks    NUMBER(5,2),
    new_marks    NUMBER(5,2),
    action_date  DATE
);

CREATE OR REPLACE TRIGGER before_student_check
BEFORE INSERT OR UPDATE ON students
FOR EACH ROW
DECLARE
BEGIN
    -- Check marks range
    IF :NEW.marks < 0 OR :NEW.marks > 100 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Marks must be between 0 and 100');
    END IF;

    -- Assign grade automatically
    IF :NEW.marks >= 90 THEN
        :NEW.grade := 'A';
    ELSIF :NEW.marks >= 75 THEN
        :NEW.grade := 'B';
    ELSIF :NEW.marks >= 50 THEN
        :NEW.grade := 'C';
    ELSE
        :NEW.grade := 'F';
    END IF;
END;
/

CREATE OR REPLACE TRIGGER after_student_audit
AFTER UPDATE OR DELETE ON students
FOR EACH ROW
DECLARE
BEGIN
    IF UPDATING THEN
        INSERT INTO student_audit (student_id, action_type, old_marks, new_marks, action_date)
        VALUES (:OLD.student_id, 'UPDATE', :OLD.marks, :NEW.marks, SYSDATE);
    ELSIF DELETING THEN
        INSERT INTO student_audit (student_id, action_type, old_marks, new_marks, action_date)
        VALUES (:OLD.student_id, 'DELETE', :OLD.marks, NULL, SYSDATE);
    END IF;
END;
/

-- Insert a valid student
INSERT INTO students (student_id, name, marks) VALUES (101, 'Rahul', 85);

-- Try inserting invalid marks
INSERT INTO students (student_id, name, marks) VALUES (102, 'Sneha', 110);
-- ❌ This will raise: ORA-20001: Marks must be between 0 and 100

-- Update marks
UPDATE students SET marks = 92 WHERE student_id = 101;

-- Delete a record
DELETE FROM students WHERE student_id = 101;

-- View students
SELECT * FROM students;

-- View audit log
SELECT * FROM student_audit;
