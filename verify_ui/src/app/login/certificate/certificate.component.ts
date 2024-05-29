import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-certificate',
  standalone: true,
  imports: [],
  templateUrl: './certificate.component.html',
  styleUrl: './certificate.component.scss'
})
export class CertificateComponent {
  @Input() certificate: any = '';
}
