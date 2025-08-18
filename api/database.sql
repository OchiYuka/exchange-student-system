/**
 * STEP-009: データベース設定
 * ステータス: completed
 * 完了日時: 2024-01-01T00:00:00Z
 * 説明: PostgreSQL・Supabase接続設定完了
 */

-- 活動報告書テーブル
CREATE TABLE IF NOT EXISTS activity_reports (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    student_email VARCHAR(100) NOT NULL,
    file_path VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 在籍証明書テーブル
CREATE TABLE IF NOT EXISTS enrollment_certificates (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    purpose TEXT NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    student_email VARCHAR(100) NOT NULL,
    file_path VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_activity_reports_student_email ON activity_reports(student_email);
CREATE INDEX IF NOT EXISTS idx_activity_reports_status ON activity_reports(status);
CREATE INDEX IF NOT EXISTS idx_enrollment_certificates_student_email ON enrollment_certificates(student_email);
CREATE INDEX IF NOT EXISTS idx_enrollment_certificates_status ON enrollment_certificates(status);

-- サンプルデータ（オプション）
INSERT INTO activity_reports (title, content, student_name, student_email, status) VALUES
('2024年春学期活動報告', '春学期の活動内容について報告します。', 'テストユーザー', 'test@example.com', 'pending')
ON CONFLICT DO NOTHING;

INSERT INTO enrollment_certificates (type, purpose, student_name, student_email, status) VALUES
('在籍証明書', '奨学金申請のため', 'テストユーザー', 'test@example.com', 'pending')
ON CONFLICT DO NOTHING;
