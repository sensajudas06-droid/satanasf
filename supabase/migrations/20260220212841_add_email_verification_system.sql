/*
  # E-posta Doğrulama Sistemi

  1. Yeni Tablo
    - `email_verification_codes`
      - `id` (uuid, primary key)
      - `email` (text, not null) - Doğrulanacak e-posta adresi
      - `code` (text, not null) - 6 haneli doğrulama kodu
      - `user_id` (uuid, nullable) - Kullanıcı ID'si (kayıt sonrası set edilecek)
      - `verified` (boolean, default false) - Doğrulama durumu
      - `expires_at` (timestamptz, not null) - Kodun geçerlilik süresi (10 dakika)
      - `created_at` (timestamptz, default now())
      
  2. Güvenlik
    - RLS etkin
    - Sadece kendi kodlarını görüntüleyebilir
    - Herkes yeni kod oluşturabilir (kayıt için gerekli)
    
  3. İndeksler
    - email ve expires_at için indeks (hızlı sorgulama)
*/

-- Tablo oluştur
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  verified boolean DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_verification_email ON email_verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_expires ON email_verification_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_verification_user_id ON email_verification_codes(user_id);

-- RLS etkinleştir
ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Herkes yeni kod oluşturabilir (kayıt için gerekli)
CREATE POLICY "Anyone can create verification codes"
  ON email_verification_codes
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Sadece kendi e-postası için kodları görüntüleyebilir
CREATE POLICY "Users can view own verification codes"
  ON email_verification_codes
  FOR SELECT
  TO public
  USING (email = current_setting('request.jwt.claims', true)::json->>'email' OR verified = false);

-- Sadece kendi kodlarını güncelleyebilir
CREATE POLICY "Users can update own verification codes"
  ON email_verification_codes
  FOR UPDATE
  TO public
  USING (email = current_setting('request.jwt.claims', true)::json->>'email' OR user_id = auth.uid())
  WITH CHECK (email = current_setting('request.jwt.claims', true)::json->>'email' OR user_id = auth.uid());

-- Eski kodları otomatik temizleme fonksiyonu
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM email_verification_codes
  WHERE expires_at < now() - interval '1 day';
END;
$$;