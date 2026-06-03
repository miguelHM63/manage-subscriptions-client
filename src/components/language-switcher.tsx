import { useLanguage } from '@/hooks/use-language';
import { Language } from '@/types/language.enum';
import { Radio, type RadioChangeEvent } from 'antd';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const onChange = (e: RadioChangeEvent) => {
    setLanguage(e.target.value);
  };

  return (
    <Radio.Group onChange={onChange} defaultValue={language}>
      <Radio.Button value={Language.English}>EN</Radio.Button>
      <Radio.Button value={Language.Spanish}>ES</Radio.Button>
    </Radio.Group>
  );
}
