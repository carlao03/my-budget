-- Insert default categories for each user
-- This will be handled by the application when a user first logs in
-- But we can create a function to do it automatically

CREATE OR REPLACE FUNCTION public.create_default_categories_for_user(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, color, icon, is_default)
  VALUES
    (p_user_id, 'Alimentação', '#ef4444', 'Utensils', true),
    (p_user_id, 'Transporte', '#f59e0b', 'Car', true),
    (p_user_id, 'Lazer', '#8b5cf6', 'Gamepad2', true),
    (p_user_id, 'Saúde', '#10b981', 'Heart', true),
    (p_user_id, 'Educação', '#3b82f6', 'GraduationCap', true),
    (p_user_id, 'Moradia', '#6366f1', 'Home', true),
    (p_user_id, 'Salário', '#10b981', 'Briefcase', true),
    (p_user_id, 'Investimentos', '#8b5cf6', 'TrendingUp', true),
    (p_user_id, 'Outros', '#6b7280', 'MoreHorizontal', true)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create default categories when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.create_default_categories_for_user(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
