import { Injectable } from '@angular/core';
import { Project } from '../_models/Project';
import { Tag } from '../_models/tag';
import { environment } from '../../environments/environment';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private username = 'Stoica-David';

  projects: Project[] = [];

  constructor() {
    this.loadProjects();
   }

  async loadProjects() {
    try {
      this.projects = await
      this.fetchGitHubProjects();
    } catch (error) {
      console.error("Failed to load GitHub projects!");
    }
  }

  GetProjects() {
    return this.projects;
  }

  GetProjectById(id: number): Project {
    let project = this.projects.find(project => project.id === id);

    if (project === undefined) {
      throw new TypeError(`There is no project that matches the following id: ${id}`);
    }

    return project;
  }

  GetProjectsByFilter(filterTags: Tag[]) {
    let filteredProjects: Project[] = [];

    console.log(filterTags);
    console.log(this.projects);
    console.log(filteredProjects);

    this.projects.forEach(function (project) {
      let foundAll = true;

      filterTags.forEach(function (filterTag) {
        if (!project.tags.includes(filterTag)) {
          foundAll = false;
        }
      });

      if (foundAll) {
        filteredProjects.push(project);
      }
    });

    return filteredProjects;
  }

  async fetchGitHubProjects(): Promise<Project[]> {
    const reposUrl = `https://api.github.com/users/${this.username}/repos`;

    try {
      const response = await axios.get<any[]>(reposUrl, {
        headers: {
          Authorization: `token ${environment.api_key}`,
          Accept: 'application/vnd.github.v3+json'
        }
      });
      const repos = response.data;

      const projectList: Project[] = [];

      const languageToTagMap: { [key: string]: Tag } = {
        'TypeScript': Tag.TYPESCRIPT,
        'JavaScript': Tag.JAVASCRIPT,
        'Python': Tag.PYTHON,
        'C#': Tag.CSHARP,
        'Java': Tag.JAVA,
        'Node.js': Tag.NODEJS,
        'Angular': Tag.ANGULAR,
        'React': Tag.REACT,
        'C++': Tag.CPP,
        'C': Tag.C
      };

      for (const repo of repos) {
        const { name, html_url, description, languages_url } = repo;

        const languagesResponse = await axios.get<{ [key: string]: number }>(languages_url, {
          headers: {
            Authorization: `token ${environment.api_key}`
          }
        });
        const languagesData = languagesResponse.data;

        const readmeResponse = await axios.get<string>(`https://api.github.com/repos/${this.username}/${name}/readme`, {
          headers: {
            Authorization: `token ${environment.api_key}`,
            Accept: 'application/vnd.github.v3.raw'
          }
        });

        const readmeContent = readmeResponse.data;
        const { longDescription, imageLinks } = this.extractLongDescriptionAndImages(readmeContent);

        const project: Project = {
          id: projectList.length + this.projects.length,
          name,
          summary: description || "This is a project",
          description: longDescription,
          projectLink: html_url,
          pictures: imageLinks,
          tags: Object.keys(languagesData)
            .map(lang => languageToTagMap[lang] || null)
            .filter(tag => tag !== null) as Tag[]
        };

        if (project.tags.includes(Tag.TYPESCRIPT)) {
          project.tags.push(Tag.ANGULAR);
        }

        if (project.pictures.length === 0) {
          project.pictures.push('assets/Image1.jpg');
        }
        
        if (project.pictures.length === 1) {
          project.pictures.push('assets/Image2.jpg');
        }
        
        if (project.pictures.length === 2) {
          project.pictures.push('assets/Image3.jpg');
        }

        projectList.push(project);
      }

      return projectList;

    } catch (error) {
      console.error('Error fetching GitHub projects:', error);
      throw error;
    }
  }

  private extractLongDescriptionAndImages(content: string): { longDescription: string; imageLinks: string[] } {
    const lines = content.split('\n');

    const relevantLines = lines.slice(1);
    const firstHeaderIndex = relevantLines.findIndex(line => line.trim().startsWith('## '));
    const secondHeaderIndex = relevantLines.slice(firstHeaderIndex + 1).findIndex(line => line.trim().startsWith('## '));

    let longDescription: string;
    let endIndex: number;

    if (firstHeaderIndex !== -1 && secondHeaderIndex !== -1) {
        endIndex = firstHeaderIndex + 1 + secondHeaderIndex;
        const longDescriptionLines = relevantLines.slice(firstHeaderIndex + 1, endIndex).map(line => line.trim()).filter(line => line.length > 0);
        longDescription = longDescriptionLines.join('\n').trim();
    } else {
        const regex = /!\[.*?\]\((.*?)\)/g;
        let matches;
        let firstImageIndex = content.length;

        while ((matches = regex.exec(content)) !== null) {
            firstImageIndex = matches.index;
            break;
        }

        longDescription = content.slice(0, firstImageIndex).trim().split('\n\n').slice(1).join('\n\n');
    }

    const imageLinks: string[] = [];
    let matchesImage;
    const regexImages = /!\[.*?\]\((.*?)\)/g;

    while ((matchesImage = regexImages.exec(content)) !== null) {
        imageLinks.push(matchesImage[1]);
    }

    return { longDescription, imageLinks };
  }
}