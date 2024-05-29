import { Component } from '@angular/core';
import { InstitutionService } from './institution.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../login/login.service';

@Component({
  selector: 'app-institution',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './institution.component.html',
  styleUrl: './institution.component.scss' 
})
export class InstitutionComponent {
  institutions:any
  isAdmin:boolean = true
  selectedInstitution:number = 0;
  constructor(private institutionService:InstitutionService, private loginService:LoginService) {}

  ngOnInit(): void {

    const data = this.loginService.getDecodedToken();
    if(data.role == 'organization'){
      this.isAdmin = false;
      this.selectedInstitution = data.InstitutionID
      this.getInstitutionById()
    }else{
      this.getInstitutions()
    }
  }

  getInstitutions(): void {
    this.institutionService.getInstitutions().subscribe((data) => {
      this.institutions = data;
    });
  }

  getInstitutionById(): void {
    this.institutionService.getInstitutionById(this.selectedInstitution).subscribe((data) => {
      this.institutions = data;
    });
  }

}
