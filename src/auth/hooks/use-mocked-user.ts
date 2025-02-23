import { _mock } from 'src/_mock';

// To get the user from the <AuthContext/>, you can use

// Change:
// import { useMockedUser } from 'src/auth/hooks';
// const { user } = useMockedUser();

// To:
// import { useAuthContext } from 'src/auth/hooks';
// const { user } = useAuthContext();

// ----------------------------------------------------------------------

export function useMockedUser() {
  const user = {
    id: '8864c717-587d-472a-929a-8e5f298024da-0',
    displayName: 'Sagar Hasan',
    email: 'sagarhasan00@gmail.com',
    userId: 'YdsdYh992',
    photoURL: _mock.image.avatar(24),
    country: _mock.countryNames(4),
    address: '90210 Broadway Blvd',
    state: 'Dhaka',
    nativeLanguage: 'Bangla',
    secondaryLanguage: 'English',
    about: 'Praesent turpis. Phasellus viverra nulla ut metus varius laoreet. Phasellus tempus.',
    role: 'user',
    isPublic: true,
  };

  return { user };
}
