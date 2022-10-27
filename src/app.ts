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
        this.element.addEventListener('submit', this.submitHandler.bind(this));
    }

    private submitHandler(event: Event) {
        event.preventDefault();

    }
}

const projectInput = new ProjectInput();
