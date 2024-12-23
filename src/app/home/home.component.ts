import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ProjectsService } from '../_services/projects.service';
import { Project } from '../_models/Project';
import { delay } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredProject = {} as Project;

  constructor(private titleService: Title, private projectService: ProjectsService){
    this.titleService.setTitle('Stoica David Ioan - Home');
  }

  ngOnInit(): void {
    try
    {
      this.featuredProject = this.projectService.GetProjectById(0);
    }
    catch(error) {
       
    }
  }
}
