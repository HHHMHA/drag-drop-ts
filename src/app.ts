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
type Listener<T> = (items: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}

class ProjectState extends State<Project> {
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
        super()
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

// Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    private templateElement: HTMLTemplateElement;
    private hostElement: T;
    protected element: U;

    constructor(
        templateId: string,
        hostElementId: string,
        insertAtStart: boolean = true,
        newElementId?: string,
    ) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId)! as T;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as U;
        if (newElementId)
            this.element.id = newElementId;

        this.configure();
        this.attach(insertAtStart);
        this.renderContent();
    }

    private attach(insertAtStart: boolean) {
        this.hostElement.insertAdjacentHTML(insertAtStart ? 'afterbegin' : 'beforeend', this.element);
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

// Project List
class ProjectList extends Component<HTMLDivElement, HTMLElement>{
    private assignedProjects: Project[] = [];

    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', false, `${type}-projects`)
    }

    renderContent() {
        this.element.querySelector('ul')!.id = this.listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + " Projects";
    }

    configure(): void {
        projectState.addListener((projects: Project[]) => {
            this.assignedProjects = projects.filter(element => {
                if (this.type == 'active') {
                    return element.status === ProjectStatus.ACTIVE;
                }
                return element.status === ProjectStatus.FINISHED;
            });
            this.renderProjects()
        });
    }

    private renderProjects() {
        const listEl = document.getElementById(this.listId)! as HTMLUListElement;
        listEl.innerHTML = '';
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
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    private titleInputElement: HTMLInputElement;
    private descriptionInputElement: HTMLInputElement;
    private peopleInputElement: HTMLInputElement;

    constructor() {
        super('project-input', 'app', true, 'user-input')

        this.titleInputElement = this.element.querySelector("#title")! as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector("#description")! as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector("#people")! as HTMLInputElement;
    }

    configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }

    renderContent(): void {

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
