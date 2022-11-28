// Project Type
enum ProjectStatus {
    ACTIVE,
    FINISHED,
}

class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus,
    ) {
    }
}

// Project State Management
type Listener = (items: Project[]) => void;

class ProjectState {
    private listeners: Listener[] = [];
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
    }

    static getInstance() {
        if (this.instance)
            return this.instance;
        this.instance = new ProjectState();
        return this.instance;
    }

    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            numOfPeople,
            ProjectStatus.ACTIVE,
        )
        this.projects.push(newProject);
        this.notifyListeners();
    }

    addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn);
    }

    private notifyListeners() {
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}

const projectState = ProjectState.getInstance();

// Validation
interface Validatable {
    value:  string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatableInput: Validatable) {
    const stringValue = validatableInput.value.toString();
    if (
        validatableInput.required &&
        stringValue.trim().length === 0
    ) {
        return false;
    }

    if (
        validatableInput.minLength != null &&
        typeof validatableInput.value == 'string' &&
        stringValue.length <= validatableInput.minLength
    ) {
        return false;
    }

    if (
        validatableInput.maxLength != null &&
        typeof validatableInput.value == 'string' &&
        stringValue.length >= validatableInput.maxLength
    ) {
        return false;
    }

    if (
        validatableInput.min &&
        typeof validatableInput.value == 'number' &&
        validatableInput.value <= validatableInput.min
    ) {
        return false;
    }

    if (
        validatableInput.max &&
        typeof validatableInput.value == 'number' &&
        validatableInput.value >= validatableInput.max
    ) {
        return false;
    }

    return true;
}

// autobind decorator
function autobind(
    _: any,
    _2: string,
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            return originalMethod.bind(this);
        }
    };

    return adjDescriptor;
}


// Project List
class ProjectList {
    private templateElement: HTMLTemplateElement;
    private hostElement: HTMLDivElement;
    private element: HTMLElement;
    private assignedProjects: Project[] = [];

    constructor(private type: 'active' | 'finished') {
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-projects`;

        projectState.addListener((projects: Project[]) => {
            this.assignedProjects = projects;
            this.renderProjects()
        });

        this.attach();
        this.renderContent();
    }

    private attach() {
        this.hostElement.insertAdjacentHTML('beforeend', this.element);
    }

    private renderContent() {
        this.element.querySelector('ul')!.id = this.listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + " Projects";
    }

    private renderProjects() {
        const listEl = document.getElementById(this.listId)! as HTMLUListElement;
        for (const projectItem of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = projectItem.title;
            listEl.append(listItem);
        }
    }

    private get listId(): string {
        return `${this.type}-project-list`;
    }
}


// ProjectInput Class
class ProjectInput {
    private templateElement: HTMLTemplateElement;
    private hostElement: HTMLDivElement;
    private element: HTMLFormElement;
    private titleInputElement: HTMLInputElement;
    private descriptionInputElement: HTMLInputElement;
    private peopleInputElement: HTMLInputElement;

    constructor() {
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = 'user-input';

        this.titleInputElement = this.element.querySelector("#title")! as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector("#description")! as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector("#people")! as HTMLInputElement;

        this.configure();
        this.attach();
    }

    private attach() {
        this.hostElement.insertAdjacentHTML('afterbegin', this.element);
    }

    private configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }

    @autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (!Array.isArray(userInput)) {
            return;
        }

        const [title, desc, people] = userInput;
        projectState.addProject(title, desc, people);
        this.clearInputs();
    }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        if (
            !validate({value: enteredTitle, required: true}) ||
            !validate({value: enteredDescription, required: true, minLength: 5}) ||
            !validate({value: +enteredPeople, required: true, min: 1})
        ) {
            alert("Invalid input!");
            return;
        }

        return [enteredTitle, enteredDescription, +enteredPeople]
    }

    private clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
