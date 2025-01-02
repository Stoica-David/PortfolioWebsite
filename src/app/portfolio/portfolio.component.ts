import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Project } from '../_models/Project';
import { ProjectsService } from '../_services/projects.service';
import { Tag } from '../_models/tag';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent {  
  projects = {} as Project[];

  isCollapsed: boolean = true;

  filtering: boolean = false;

  typeScript: boolean = false;
  angular: boolean = false;
  python: boolean = false;
  csharp: boolean = false;
  java: boolean = false;
  nodejs: boolean = false;
  aspnet: boolean = false;
  javascript: boolean = false;
  react: boolean = false;
  c: boolean = false;
  cpp: boolean = false;

  constructor(private titleService: Title, private projectService: ProjectsService){
    this.titleService.setTitle('Stoica David Ioan - Portfolio');
  }

  ngOnInit(): void {
    this.projects = this.projectService.GetProjects();
  }

  Filter() {
    let filterTags: Tag[] = [];

    if (this.typeScript) {
      filterTags.push(Tag.TYPESCRIPT);
    }

    if (this.angular) {
      filterTags.push(Tag.ANGULAR);
    }

    if (this.python) {
      filterTags.push(Tag.PYTHON);
    }

    if (this.csharp) {
      filterTags.push(Tag.CSHARP);
    }

    if (this.java) {
      filterTags.push(Tag.JAVA);
    }
    
    if (this.nodejs) {
      filterTags.push(Tag.NODEJS);
    }

    if (this.aspnet) {
      filterTags.push(Tag.ASPNET);
    }

    if (this.javascript) {
      filterTags.push(Tag.JAVASCRIPT);
    }

    if (this.react) {
      filterTags.push(Tag.REACT);
    }

    if (this.c) {
      filterTags.push(Tag.C);
    }

    if (this.cpp) {
      filterTags.push(Tag.CPP);
    }

    if (this.python || this.csharp || this.java || this.angular || this.typeScript || this.nodejs || this.aspnet || this.javascript || this.react || this.c || this.cpp) {
      this.filtering = true;
    }
    else {
      this.filtering = false;
    }

    this.projects = this.projectService.GetProjectsByFilter(filterTags);
  }

  ResetFilters() {
    this.python = false;
    this.csharp = false;
    this.java = false;
    this.javascript = false;
    this.angular = false;
    this.aspnet = false;
    this.nodejs = false;
    this.react = false;
    this.typeScript = false;
    this.c = false;
    this.cpp = false;

    this.filtering = false;

    this.projects = this.projectService.GetProjects();
  }
}
