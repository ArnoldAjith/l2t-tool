import { Routes } from '@angular/router';
import { AdcopyCheck } from './adcopy-check/adcopy-check';
import { Dashboard } from './dashboard/dashboard';
import { IncentiveAutomation } from './incentive-automation/incentive-automation';
import { Login } from './login/login';
import { Register } from './register/register';
import { HomePage } from './home-page/home-page';
import { Signup } from './signup/signup';
import { Header } from './header/header';


export const appRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'header', component: Header },
  { path: 'dashboard', component: Dashboard },
  { path: 'login', component: Login },
  { path: 'adcopy', component: AdcopyCheck },
  { path: 'incentive', component: IncentiveAutomation },
  { path: 'register', component: Register },
  { path: 'home', component: HomePage },
  { path: 'signup', component: Signup },
];
