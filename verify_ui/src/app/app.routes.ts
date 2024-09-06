import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { InstitutionComponent } from './main/institution/institution.component';
import { IndividualComponent } from './main/individual/individual.component';
import { CertificateComponent } from './main/certificate/certificate.component';
import { SettingsComponent } from './main/settings/settings.component';


export const routes: Routes = [
    {path:'', component:LoginComponent},
    {
        path: 'main',
        component: MainComponent,
        children: [
          { path: 'institution', component: InstitutionComponent },
          { path: 'individual', component: IndividualComponent },
          { path: 'certificate', component: CertificateComponent },
          { path: 'settings', component: SettingsComponent }
        ]
      }
];
