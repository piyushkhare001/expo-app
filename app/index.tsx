import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function Index() {
  const profiles = useSelector((state: RootState) => state.profile.profiles);

  return profiles.length > 0
    ? <Redirect href="/profiles" />
    : <Redirect href="/step1" />;
}
