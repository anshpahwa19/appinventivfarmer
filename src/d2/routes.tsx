import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { Navigate, Route, Routes, type Location } from 'react-router-dom';
import { useStore } from '@/services/store';
import Home from './screens/home/Home';
import { to } from './paths';

type Loader = () => Promise<{ default: ComponentType }>;
const loaders: Loader[] = [];
function page(l: Loader): LazyExoticComponent<ComponentType> {
  loaders.push(l);
  return lazy(l);
}
export function prefetchD2() {
  loaders.forEach((l) => l().catch(() => undefined));
}

const Welcome = page(() => import('./screens/onboarding/Welcome'));
const ChooseLanguage = page(() => import('./screens/onboarding/ChooseLanguage'));
const Auth = page(() => import('./screens/onboarding/Auth'));
const Otp = page(() => import('./screens/onboarding/Otp'));
const LocationAccess = page(() => import('./screens/onboarding/LocationAccess'));
const Learn = page(() => import('./screens/learn/Learn'));
const Story = page(() => import('./screens/learn/Story'));
const Video = page(() => import('./screens/learn/Video'));
const Bookmarks = page(() => import('./screens/learn/Bookmarks'));
const Search = page(() => import('./screens/learn/Search'));
const Events = page(() => import('./screens/events/Events'));
const EventDetail = page(() => import('./screens/events/EventDetail'));
const Orders = page(() => import('./screens/orders/Orders'));
const OrderDetail = page(() => import('./screens/orders/OrderDetail'));
const NewOrder = page(() => import('./screens/orders/NewOrder'));
const OrderPlaced = page(() => import('./screens/orders/OrderPlaced'));
const BookingDetail = page(() => import('./screens/orders/BookingDetail'));
const NewBooking = page(() => import('./screens/orders/NewBooking'));
const BookingRequested = page(() => import('./screens/orders/BookingRequested'));
const Forms = page(() => import('./screens/forms/Forms'));
const FormDetail = page(() => import('./screens/forms/FormDetail'));
const StepDetail = page(() => import('./screens/forms/StepDetail'));
const Lands = page(() => import('./screens/lands/Lands'));
const LandDetail = page(() => import('./screens/lands/LandDetail'));
const NewLand = page(() => import('./screens/lands/NewLand'));
const Notifications = page(() => import('./screens/notifications/Notifications'));
const Account = page(() => import('./screens/account/Account'));
const Profile = page(() => import('./screens/account/Profile'));
const Language = page(() => import('./screens/account/Language'));
const Password = page(() => import('./screens/account/Password'));
const Machinery = page(() => import('./screens/account/Machinery'));
const Help = page(() => import('./screens/account/Help'));
const Contact = page(() => import('./screens/account/Contact'));
const About = page(() => import('./screens/account/About'));
const Legal = page(() => import('./screens/account/Legal'));
const Verify = page(() => import('./screens/account/Verify'));
const PrototypeControls = page(() => import('./screens/account/PrototypeControls'));
const DesignSystem = page(() => import('./screens/system/DesignSystem'));
const NotFound = page(() => import('./screens/NotFound'));

function RootRedirect() {
  const session = useStore((st) => st.session);
  if (!session.onboarded) return <Navigate to={to('/welcome')} replace />;
  if (!session.signedIn) return <Navigate to={to('/auth')} replace />;
  return <Navigate to={to('/home')} replace />;
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const signedIn = useStore((s) => s.session.signedIn);
  return signedIn ? children : <Navigate to={to('/')} replace />;
}

const authed = (el: JSX.Element) => <RequireAuth>{el}</RequireAuth>;

export function D2Routes({ location }: { location: Location }) {
  return (
    <Routes location={location}>
      <Route path="/d2">
        <Route index element={<RootRedirect />} />
        <Route path="welcome" element={<Welcome />} />
        <Route path="welcome/language" element={<ChooseLanguage />} />
        <Route path="auth" element={<Auth />} />
        <Route path="auth/otp" element={<Otp />} />
        <Route path="auth/location" element={<LocationAccess />} />

        <Route path="home" element={authed(<Home />)} />
        <Route path="learn" element={authed(<Learn />)} />
        <Route path="search" element={authed(<Search />)} />
        <Route path="news/:id" element={authed(<Story />)} />
        <Route path="articles/:id" element={authed(<Story />)} />
        <Route path="videos/:id" element={authed(<Video />)} />
        <Route path="bookmarks" element={authed(<Bookmarks />)} />

        <Route path="events" element={authed(<Events />)} />
        <Route path="events/:id" element={authed(<EventDetail />)} />

        <Route path="orders" element={authed(<Orders />)} />
        <Route path="orders/fom/new" element={authed(<NewOrder />)} />
        <Route path="orders/fom/:id" element={authed(<OrderDetail />)} />
        <Route path="orders/fom/:id/placed" element={authed(<OrderPlaced />)} />
        <Route path="bookings/new" element={authed(<NewBooking />)} />
        <Route path="bookings/:id" element={authed(<BookingDetail />)} />
        <Route path="bookings/:id/requested" element={authed(<BookingRequested />)} />

        <Route path="forms" element={authed(<Forms />)} />
        <Route path="forms/:id" element={authed(<FormDetail />)} />
        <Route path="forms/:id/steps/:stepId" element={authed(<StepDetail />)} />

        <Route path="lands" element={authed(<Lands />)} />
        <Route path="lands/new" element={authed(<NewLand />)} />
        <Route path="lands/:id" element={authed(<LandDetail />)} />

        <Route path="notifications" element={authed(<Notifications />)} />

        <Route path="account" element={authed(<Account />)} />
        <Route path="account/profile" element={authed(<Profile />)} />
        <Route path="account/language" element={authed(<Language />)} />
        <Route path="account/password" element={authed(<Password />)} />
        <Route path="account/machinery" element={authed(<Machinery />)} />
        <Route path="account/help" element={authed(<Help />)} />
        <Route path="account/contact" element={authed(<Contact />)} />
        <Route path="account/about" element={authed(<About />)} />
        <Route path="account/legal/:doc" element={<Legal />} />
        <Route path="account/verify" element={authed(<Verify />)} />
        <Route path="account/prototype" element={authed(<PrototypeControls />)} />
        <Route path="design-system" element={<DesignSystem />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
