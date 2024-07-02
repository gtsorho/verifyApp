import { CommonModule } from '@angular/common';
import { Component , OnInit} from '@angular/core';
import { LoaderService } from '../loader.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import axios from 'axios';
import { FormsModule } from '@angular/forms';
import { IndividualService } from './individual.service';
import { InstitutionService } from '../institution/institution.service';
import { LoginService } from '../../login/login.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';


interface individual {
  id?: number,
  Certificates?: any[],
  organization: string,
  ghana_card: string,
}

interface certification {
  id?: number,
  CertificateId: string,
  IndividualId: string,
  issueDate: Date,
  expiryDate: Date,
}

@Component({
  selector: 'app-individual',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './individual.component.html',
  styleUrl: './individual.component.scss'
})
export class IndividualComponent implements OnInit {


  individual: individual = {
    organization: '',
    ghana_card: ''
  }

  token: string = "";
  openTab: number = 1;
  baseUrl: string = this.loaderService.baseUrl()
  individuals: individual[] = [];
  showSubTable: boolean[] = [];
  isOpen = false;
  options = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
  selectedOptions: {
    id: number,
    checked: boolean
  }[] = [];
  institution: any
  institutions: any = []
  selectedInstitution: number = 0;
  certificates: any = [];
  selectedCertificate: number = 0;
  prefix: string = '';
  certificate: any
  certification: certification = {
    CertificateId: '',
    IndividualId: '',
    issueDate: new Date,
    expiryDate: new Date,
  }
  isAdmin:boolean = true
  uploadForm: FormGroup;
  file: File | null = null;

  constructor(private loaderService: LoaderService, private loginService:LoginService, private individualService: IndividualService, private institutionService: InstitutionService, private fb: FormBuilder) {
    this.individuals = [];
    this.showSubTable = new Array(this.individuals.length).fill(false);
    this.uploadForm = this.fb.group({
      file: [null, Validators.required],
      institution: [0, Validators.required],
      certificate: [0, Validators.required]
    });
  }
  ngOnInit(): void {
    this.token = this.getCookie('token')
    this.getIndividuals()
      const data = this.loginService.getDecodedToken();
      if(data.role == 'organization'){
        this.isAdmin = true;
        this.selectedInstitution = data.InstitutionID
        this.getInstitutionById()
      }else{
        this.getInstitutions()
      }
    }
  createIndividual() {
    axios.post(this.baseUrl + '/individual', this.individual,
      { 'headers': { 'authorization': 'Bearer ' + this.token } }
    ).then((response) => {
      this.getIndividuals()
    }).catch((error) => {
      console.log(error);
    })
  }

  createCertification() {
    const selected = this.selectedOptions.filter(option => option.checked);
    const axiosFunction = async (individual: any) => {
      this.certification.IndividualId = individual.id;
      return axios.post(this.baseUrl + '/individual/certify', this.certification, {
        headers: { 'authorization': 'Bearer ' + this.token }
      });
    }

    const requests = selected.map(option => axiosFunction(option));

    Promise.allSettled(requests)
      .then(results => {
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            console.log(`Request for ${selected[index].id} succeeded:`, result.value);
          } else {
            console.error(`Request for ${selected[index].id} failed:`, result.reason);
          }
        });
      })
      .catch(error => {
        console.error('Error with requests:', error);
      });
  }

  getIndividuals() {
    this.individualService.getIndividuals().subscribe((data) => {
      this.individuals = data
      this.initializeSelectedOptions();

    });
  }
  getInstitutions() {
    this.institutionService.getInstitutions().subscribe((data) => {
      this.institutions = data[0]
    });
  }
  getInstitutionById(): void {
    this.institutionService.getInstitutionById(this.selectedInstitution).subscribe((data) => {
      this.institutions = data[0];
    });
  }
  toggleSubTable(index: number): void {
    this.showSubTable[index] = !this.showSubTable[index];
  }
  getCertificates() {
    this.selectedInstitution = this.uploadForm.get('institution')?.value;
    if (this.selectedInstitution) {
      this.institution = this.institutions.find((inst: { id: number; }) => inst.id === +this.selectedInstitution)
      this.certificates = this.institution.Certificates
      console.log(this.certificates)
    }
  }


  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  initializeSelectedOptions() {
    this.selectedOptions = this.individuals.map(individual => ({
      id: individual.id || 0,
      checked: false
    }));
  }

  getCookie(cname: string) {
    let name = cname + '=';
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.file = input.files[0];
      this.uploadForm.patchValue({
        file: this.file
      });
    }
  }

  onSubmit() {
    if (!this.file) {
      return;
    }

    const formData = new FormData();
    formData.append('excelFile', this.file);
    // formData.append('certificate', this.uploadForm.get('certificate')?.value);

    axios.post(`${this.baseUrl}/individual/upload`, formData,{
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })
      .then(response => {
        console.log('Upload successful', response.data);
      })
      .catch(error => {
        console.error('Upload failed', error);
      });
  }

  downloadFile() {
    axios.get(`${this.baseUrl}/individual/download`,{
       responseType: 'blob',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
    
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'template.xlsx'); // Set the file name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); // Clean up
      })
      .catch(error => {
        console.error('Upload failed', error);
      });
  }
    
    
}
