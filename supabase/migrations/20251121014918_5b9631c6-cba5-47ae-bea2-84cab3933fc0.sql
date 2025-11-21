-- Add language column to profiles table for i18n support
ALTER TABLE public.profiles 
ADD COLUMN language VARCHAR(2) DEFAULT 'pt' CHECK (language IN ('pt', 'en', 'es'));

COMMENT ON COLUMN public.profiles.language IS 'Idioma preferido do usuário (pt=Português, en=English, es=Español)';

-- Update existing profiles to have default language
UPDATE public.profiles 
SET language = 'pt' 
WHERE language IS NULL;