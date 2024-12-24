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
    const descriptionStartIndex = lines.findIndex(line => line.trim() === '') + 1;
    const trimmedContent = lines.slice(descriptionStartIndex).join('\n').trim();

    const regex = /!\[.*?\]\((.*?)\)/g;
    let matches;
    const imageLinks: string[] = [];

    let longDescriptionEndIndex = trimmedContent.length;
    while ((matches = regex.exec(trimmedContent)) !== null) {
      imageLinks.push(matches[1]);
      longDescriptionEndIndex = matches.index;
      break;
    }

    const longDescription = trimmedContent.slice(0, longDescriptionEndIndex).trim();

    return { longDescription, imageLinks };
  }
}