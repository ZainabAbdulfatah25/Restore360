import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

type Language = 'en' | 'ha' | 'ig' | 'yo' | 'pcm';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    'app.name': 'Restore 360',
    'welcome': 'Welcome',
    'dashboard': 'Dashboard',
    'cases': 'Cases',
    'registrations': 'Registrations',
    'referrals': 'Referrals',
    'settings': 'Settings',
    'users': 'Users',
    'reports': 'Reports',
    'logout': 'Logout',
    'signin': 'Sign In',
    'signup': 'Sign Up',
    'email': 'Email',
    'password': 'Password',
    'confirm_password': 'Confirm Password',
    'full_name': 'Full Name',
    'phone': 'Phone',
    'address': 'Address',
    'description': 'Description',
    'category': 'Category',
    'status': 'Status',
    'priority': 'Priority',
    'create': 'Create',
    'cancel': 'Cancel',
    'save': 'Save',
    'edit': 'Edit',
    'delete': 'Delete',
    'search': 'Search',
    'filter': 'Filter',
    'new_registration': 'New Registration',
    'new_case': 'New Case',
    'new_referral': 'New Referral',
    'total_households': 'Total Households',
    'total_beneficiaries': 'Total Beneficiaries',
    'active_cases': 'Active Cases',
    'pending_referrals': 'Pending Referrals',
    'recent_activity': 'Recent Activity',
    'quick_actions': 'Quick Actions',
    'system_status': 'System Status',
    'language_settings': 'Language Settings',
    'select_language': 'Select Language',
    'english': 'English',
    'hausa': 'Hausa',
    'igbo': 'Igbo',
    'yoruba': 'Yoruba',
    'pidgin': 'Nigerian Pidgin',
    'register_as_individual': 'Register as Individual',
    'register_as_organization': 'Register as Organization',
    'organization_name': 'Organization Name',
    'organization_type': 'Organization Type',
    'individual': 'Individual',
    'organization': 'Organization',
    'assign_to': 'Assign To',
    'authority': 'Authority',
    'select_authority': 'Select Authority',
    'case_number': 'Case Number',
    'title': 'Title',
    'welcome_message': 'Welcome to your dashboard. Manage registrations, cases, and referrals efficiently.',
  },
  ha: {
    'app.name': 'Restore 360',
    'welcome': 'Barka da zuwa',
    'dashboard': 'Dashboard',
    'cases': 'Shari\'o\'i',
    'registrations': 'Rajista',
    'referrals': 'Turawa',
    'settings': 'Saitunan',
    'users': 'Masu amfani',
    'reports': 'Rahotanni',
    'logout': 'Fita',
    'signin': 'Shiga',
    'signup': 'Yi rajista',
    'email': 'Imel',
    'password': 'Kalmar sirri',
    'confirm_password': 'Tabbatar da kalmar sirri',
    'full_name': 'Cikakken suna',
    'phone': 'Waya',
    'address': 'Adireshi',
    'description': 'Bayanai',
    'category': 'Nau\'i',
    'status': 'Matsayi',
    'priority': 'Fifiko',
    'create': 'Ƙirƙira',
    'cancel': 'Soke',
    'save': 'Adana',
    'edit': 'Gyara',
    'delete': 'Goge',
    'search': 'Nema',
    'filter': 'Tace',
    'new_registration': 'Sabuwar Rajista',
    'new_case': 'Sabon Shari\'a',
    'new_referral': 'Sabon Turawa',
    'total_households': 'Jimillar Gidaje',
    'total_beneficiaries': 'Jimillar Masu Amfani',
    'active_cases': 'Shari\'o\'i masu aiki',
    'pending_referrals': 'Turawa da ake jira',
    'recent_activity': 'Ayyukan kwanan nan',
    'quick_actions': 'Ayyuka masu sauri',
    'system_status': 'Matsayin Tsarin',
    'language_settings': 'Saitunan Harshe',
    'select_language': 'Zaɓi Harshe',
    'english': 'Turanci',
    'hausa': 'Hausa',
    'igbo': 'Igbo',
    'yoruba': 'Yarbawa',
    'pidgin': 'Pidgin na Najeriya',
    'register_as_individual': 'Yi rajista a matsayin mutum',
    'register_as_organization': 'Yi rajista a matsayin ƙungiya',
    'organization_name': 'Sunan Ƙungiya',
    'organization_type': 'Nau\'in Ƙungiya',
    'individual': 'Mutum',
    'organization': 'Ƙungiya',
    'assign_to': 'Sanya wa',
    'authority': 'Hukuma',
    'select_authority': 'Zaɓi Hukuma',
    'case_number': 'Lambar Shari\'a',
    'title': 'Taken',
    'welcome_message': 'Barka da zuwa dashboard ɗin ku. Gudanar da rajista, shari\'o\'i, da turawa yadda ya kamata.',
  },
  ig: {
    'app.name': 'Restore 360',
    'welcome': 'Nnọọ',
    'dashboard': 'Dashboard',
    'cases': 'Okwu',
    'registrations': 'Ndebanye aha',
    'referrals': 'Ntụgharị',
    'settings': 'Ntọala',
    'users': 'Ndị ọrụ',
    'reports': 'Akụkọ',
    'logout': 'Pụọ',
    'signin': 'Banye',
    'signup': 'Debanye aha',
    'email': 'Email',
    'password': 'Okwuntughe',
    'confirm_password': 'Kwenye okwuntughe',
    'full_name': 'Aha zuru ezu',
    'phone': 'Ekwentị',
    'address': 'Adreesị',
    'description': 'Nkọwa',
    'category': 'Ụdị',
    'status': 'Ọnọdụ',
    'priority': 'Mkpa',
    'create': 'Mepụta',
    'cancel': 'Kagbuo',
    'save': 'Chekwaa',
    'edit': 'Dezie',
    'delete': 'Hichapụ',
    'search': 'Chọọ',
    'filter': 'Kpochapụ',
    'new_registration': 'Ndebanye aha ọhụrụ',
    'new_case': 'Okwu ọhụrụ',
    'new_referral': 'Ntụgharị ọhụrụ',
    'total_households': 'Ezinụlọ niile',
    'total_beneficiaries': 'Ndị niile na-erite uru',
    'active_cases': 'Okwu na-arụ ọrụ',
    'pending_referrals': 'Ntụgharị na-eche',
    'recent_activity': 'Ihe mere n\'oge na-adịbeghị anya',
    'quick_actions': 'Omume ngwa ngwa',
    'system_status': 'Ọnọdụ sistemu',
    'language_settings': 'Ntọala Asụsụ',
    'select_language': 'Họrọ Asụsụ',
    'english': 'Bekee',
    'hausa': 'Hausa',
    'igbo': 'Igbo',
    'yoruba': 'Yoruba',
    'pidgin': 'Nigerian Pidgin',
    'register_as_individual': 'Debanye aha dị ka onye',
    'register_as_organization': 'Debanye aha dị ka nzukọ',
    'organization_name': 'Aha nzukọ',
    'organization_type': 'Ụdị nzukọ',
    'individual': 'Onye',
    'organization': 'Nzukọ',
    'assign_to': 'Kenye',
    'authority': 'Ikike',
    'select_authority': 'Họrọ Ikike',
    'case_number': 'Nọmba okwu',
    'title': 'Isiokwu',
    'welcome_message': 'Nnọọ na dashboard gị. Jikwaa ndebanye aha, okwu, na ntụgharị nke ọma.',
  },
  yo: {
    'app.name': 'Restore 360',
    'welcome': 'Ẹ kú àbọ̀',
    'dashboard': 'Dashboard',
    'cases': 'Ọ̀rọ̀',
    'registrations': 'Ìforúkọsílẹ̀',
    'referrals': 'Ìtọ́kasí',
    'settings': 'Ètò',
    'users': 'Àwọn olùmúlò',
    'reports': 'Ìròyìn',
    'logout': 'Jáde',
    'signin': 'Wọlé',
    'signup': 'Forúkọsílẹ̀',
    'email': 'Ímeèlì',
    'password': 'Ọ̀rọ̀ ìpamọ́',
    'confirm_password': 'Jẹ́rìísí ọ̀rọ̀ ìpamọ́',
    'full_name': 'Orúkọ kíkún',
    'phone': 'Fóònù',
    'address': 'Àdírẹ́ẹ̀sì',
    'description': 'Àpèjúwe',
    'category': 'Orísìírisìí',
    'status': 'Ipò',
    'priority': 'Pàtàkì',
    'create': 'Ṣẹ̀dá',
    'cancel': 'Fagílé',
    'save': 'Fipamọ́',
    'edit': 'Ṣàtúnṣe',
    'delete': 'Pa rẹ́',
    'search': 'Wá',
    'filter': 'Ṣàlọ',
    'new_registration': 'Ìforúkọsílẹ̀ tuntun',
    'new_case': 'Ọ̀rọ̀ tuntun',
    'new_referral': 'Ìtọ́kasí tuntun',
    'total_households': 'Àpapọ̀ àwọn ilé',
    'total_beneficiaries': 'Àpapọ̀ àwọn olùjẹ',
    'active_cases': 'Àwọn ọ̀rọ̀ tó ń lọ',
    'pending_referrals': 'Àwọn ìtọ́kasí tó ń dúró',
    'recent_activity': 'Iṣẹ́ tó ṣẹ̀ṣẹ̀',
    'quick_actions': 'Àwọn iṣẹ́ kíákíá',
    'system_status': 'Ipò ètò',
    'language_settings': 'Ètò Èdè',
    'select_language': 'Yan Èdè',
    'english': 'Gẹ̀ẹ́sì',
    'hausa': 'Hausa',
    'igbo': 'Igbo',
    'yoruba': 'Yorùbá',
    'pidgin': 'Pidgin Nàìjíríà',
    'register_as_individual': 'Forúkọsílẹ̀ gẹ́gẹ́ bíi ẹnìkọ̀ọ̀kan',
    'register_as_organization': 'Forúkọsílẹ̀ gẹ́gẹ́ bíi àjọ',
    'organization_name': 'Orúkọ àjọ',
    'organization_type': 'Irú àjọ',
    'individual': 'Ẹnìkọ̀ọ̀kan',
    'organization': 'Àjọ',
    'assign_to': 'Fi fún',
    'authority': 'Àṣẹ',
    'select_authority': 'Yan Àṣẹ',
    'case_number': 'Nọ́mbà ọ̀rọ̀',
    'title': 'Àkọ́lé',
    'welcome_message': 'Ẹ kú àbọ̀ sí dashboard rẹ. Ṣàkóso ìforúkọsílẹ̀, ọ̀rọ̀, àti ìtọ́kasí dáradára.',
  },
  pcm: {
    'app.name': 'Restore 360',
    'welcome': 'Welcome',
    'dashboard': 'Dashboard',
    'cases': 'Cases',
    'registrations': 'Registration dem',
    'referrals': 'Referral dem',
    'settings': 'Settings',
    'users': 'Users',
    'reports': 'Reports',
    'logout': 'Logout',
    'signin': 'Sign In',
    'signup': 'Sign Up',
    'email': 'Email',
    'password': 'Password',
    'confirm_password': 'Confirm Password',
    'full_name': 'Full Name',
    'phone': 'Phone',
    'address': 'Address',
    'description': 'Description',
    'category': 'Category',
    'status': 'Status',
    'priority': 'How e dey important',
    'create': 'Create',
    'cancel': 'Cancel',
    'save': 'Save',
    'edit': 'Edit',
    'delete': 'Delete',
    'search': 'Search',
    'filter': 'Filter',
    'new_registration': 'New Registration',
    'new_case': 'New Case',
    'new_referral': 'New Referral',
    'total_households': 'All Houses',
    'total_beneficiaries': 'All People wey dey benefit',
    'active_cases': 'Cases wey dey active',
    'pending_referrals': 'Referrals wey dey wait',
    'recent_activity': 'Wetin don happen recently',
    'quick_actions': 'Quick Actions',
    'system_status': 'System Status',
    'language_settings': 'Language Settings',
    'select_language': 'Choose Language',
    'english': 'English',
    'hausa': 'Hausa',
    'igbo': 'Igbo',
    'yoruba': 'Yoruba',
    'pidgin': 'Nigerian Pidgin',
    'register_as_individual': 'Register as person',
    'register_as_organization': 'Register as organization',
    'organization_name': 'Organization Name',
    'organization_type': 'Organization Type',
    'individual': 'Person',
    'organization': 'Organization',
    'assign_to': 'Give am to',
    'authority': 'Authority',
    'select_authority': 'Choose Authority',
    'case_number': 'Case Number',
    'title': 'Title',
    'welcome_message': 'Welcome to your dashboard. Manage registrations, cases, and referrals well well.',
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadUserLanguage().catch((error) => {
      console.error('Error loading user language:', error);
    });
  }, []);

  const loadUserLanguage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('language')
          .eq('id', user.id)
          .maybeSingle();

        if (data?.language) {
          setLanguageState(data.language as Language);
        }
      }
    } catch (error) {
      console.error('Failed to load user language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('users')
          .update({ language: lang })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Failed to update user language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
