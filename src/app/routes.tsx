import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { Navigate, Route, Routes, type Location } from 'react-router-dom';
import { useStore } from '@/services/store';
import Home from '@/features/home/Home';

type Loader = () => Promise<{ default: ComponentType }>;
const loaders: Loader[] = [];
function page(loader: Loader): LazyExoticComponent<ComponentType> {
  loaders.push(loader);
  return lazy(loader);
}

/** Warm the route chunks after first paint so later navigations are instant. */
export function prefetchScreens() {
  loaders.forEach((l) => l().catch(() => undefined));
}

const Welcome = page(() => import('@/features/onboarding/Welcome'));
const ChooseLanguage = page(() => import('@/features/onboarding/ChooseLanguage'));
const Auth = page(() => import('@/features/onboarding/Auth'));
const Otp = page(() => import('@/features/onboarding/Otp'));
const LocationAccess = page(() => import('@/features/onboarding/LocationAccess'));
const Learn = page(() => import('@/features/learn/Learn'));
const ContentDetail = page(() => import('@/features/learn/ContentDetail'));
const Bookmarks = page(() => import('@/features/learn/Bookmarks'));
const Events = page(() => import('@/features/events/Events'));
const EventDetail = page(() => import('@/features/events/EventDetail'));
const Orders = page(() => import('@/features/orders/Orders'));
const OrderDetail = page(() => import('@/features/orders/OrderDetail'));
const NewOrder = page(() => import('@/features/orders/NewOrder'));
const OrderPlaced = page(() => import('@/features/orders/OrderPlaced'));
const BookingDetail = page(() => import('@/features/bookings/BookingDetail'));
const NewBooking = page(() => import('@/features/bookings/NewBooking'));
const BookingRequested = page(() => import('@/features/bookings/BookingRequested'));
const Forms = page(() => import('@/features/forms/Forms'));
const FormDetail = page(() => import('@/features/forms/FormDetail'));
const StepDetail = page(() => import('@/features/forms/StepDetail'));
const Lands = page(() => import('@/features/lands/Lands'));
const LandDetail = page(() => import('@/features/lands/LandDetail'));
const NewLand = page(() => import('@/features/lands/NewLand'));
const Notifications = page(() => import('@/features/notifications/Notifications'));
const Account = page(() => import('@/features/account/Account'));
const Profile = page(() => import('@/features/account/Profile'));
const Language = page(() => import('@/features/account/Language'));
const Password = page(() => import('@/features/account/Password'));
const Machinery = page(() => import('@/features/account/Machinery'));
const Help = page(() => import('@/features/account/Help'));
const Contact = page(() => import('@/features/account/Contact'));
const About = page(() => import('@/features/account/About'));
const Legal = page(() => import('@/features/account/Legal'));
const Verify = page(() => import('@/features/account/Verify'));
const PrototypeControls = page(() => import('@/features/account/PrototypeControls'));
const DesignSystem = page(() => import('@/features/design-system/DesignSystem'));
const NotFound = page(() => import('@/features/NotFound'));

function RootRedirect() {
  const session = useStore((st) => st.session);
  if (!session.onboarded) return <Navigate to="/welcome" replace />;
  if (!session.signedIn) return <Navigate to="/auth" replace />;
  return <Navigate to="/home" replace />;
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const signedIn = useStore((s) => s.session.signedIn);
  return signedIn ? children : <Navigate to="/" replace />;
}

const authed = (el: JSX.Element) => <RequireAuth>{el}</RequireAuth>;

export function AppRoutes({ location }: { location: Location }) {
  return (
    <Routes location={location}>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/welcome/language" element={<ChooseLanguage />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/otp" element={<Otp />} />
      <Route path="/auth/location" element={<LocationAccess />} />

      <Route path="/home" element={authed(<Home />)} />
      <Route path="/learn" element={authed(<Learn />)} />
      <Route path="/news/:id" element={authed(<ContentDetail />)} />
      <Route path="/articles/:id" element={authed(<ContentDetail />)} />
      <Route path="/videos/:id" element={authed(<ContentDetail />)} />
      <Route path="/bookmarks" element={authed(<Bookmarks />)} />

      <Route path="/events" element={authed(<Events />)} />
      <Route path="/events/:id" element={authed(<EventDetail />)} />

      <Route path="/orders" element={authed(<Orders />)} />
      <Route path="/orders/fom/new" element={authed(<NewOrder />)} />
      <Route path="/orders/fom/:id" element={authed(<OrderDetail />)} />
      <Route path="/orders/fom/:id/placed" element={authed(<OrderPlaced />)} />
      <Route path="/bookings/new" element={authed(<NewBooking />)} />
      <Route path="/bookings/:id" element={authed(<BookingDetail />)} />
      <Route path="/bookings/:id/requested" element={authed(<BookingRequested />)} />

      <Route path="/forms" element={authed(<Forms />)} />
      <Route path="/forms/:id" element={authed(<FormDetail />)} />
      <Route path="/forms/:id/steps/:stepId" element={authed(<StepDetail />)} />

      <Route path="/lands" element={authed(<Lands />)} />
      <Route path="/lands/new" element={authed(<NewLand />)} />
      <Route path="/lands/:id" element={authed(<LandDetail />)} />

      <Route path="/notifications" element={authed(<Notifications />)} />

      <Route path="/account" element={authed(<Account />)} />
      <Route path="/account/profile" element={authed(<Profile />)} />
      <Route path="/account/language" element={authed(<Language />)} />
      <Route path="/account/password" element={authed(<Password />)} />
      <Route path="/account/machinery" element={authed(<Machinery />)} />
      <Route path="/account/help" element={authed(<Help />)} />
      <Route path="/account/contact" element={authed(<Contact />)} />
      <Route path="/account/about" element={authed(<About />)} />
      <Route path="/account/legal/:doc" element={<Legal />} />
      <Route path="/account/verify" element={authed(<Verify />)} />
      <Route path="/account/prototype" element={authed(<PrototypeControls />)} />
      <Route path="/design-system" element={<DesignSystem />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
