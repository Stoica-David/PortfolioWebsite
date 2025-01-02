import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ProjectsService } from '../_services/projects.service';
import { Project } from '../_models/Project';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredProject = {} as Project;
  projects = {} as Project[];
  areProjectsLoaded: boolean = false;

  constructor(private titleService: Title, private projectService: ProjectsService){
    this.titleService.setTitle('Stoica David Ioan - Home');
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  async loadProjects() {
    try {
      this.projects = await
      this.projectService.fetchGitHubProjects();
      this.projectService.projects = this.projects;

      this.featuredProject = this.projects[0];
      this.areProjectsLoaded = true;
    } catch (error) {
      console.error("Failed to load GitHub projects!");
    }
  }
}
