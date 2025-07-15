// DropdownMenu.js - reusable dropdown menu module
// Usage: new DropdownMenu({
//   trigger: HTMLElement,
//   options: [{ label, id, onClick }],
//   container: HTMLElement (optional, default: document.body),
//   zIndex: number (optional)
// })

class DropdownMenu {
    constructor({ trigger, options, container = document.body, zIndex = 9999 }) {
        this.trigger = trigger;
        this.options = options;
        this.container = container;
        this.zIndex = zIndex;
        this.menu = this._createMenu();
        this._bindEvents();
    }

    _createMenu(options = this.options, parentMenu = null) {
        const menu = document.createElement('div');
        menu.className = 'dropdown-menu';
        menu.style.zIndex = this.zIndex;
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'dropdown-menu-option';
            btn.textContent = opt.label;
            btn.id = opt.id || '';
            btn.onclick = (e) => {
                this._hideAllMenus();
                if (typeof opt.onClick === 'function') opt.onClick(e);
            };
            menu.appendChild(btn);

            // Submenu support
            if (opt.submenu && Array.isArray(opt.submenu)) {
                btn.classList.add('has-submenu');
                const submenu = this._createMenu(opt.submenu, menu);
                submenu.style.display = 'none';
                submenu.style.position = 'absolute';
                submenu.style.left = '100%';
                submenu.style.top = btn.offsetTop + 'px';
                menu.appendChild(submenu);

                btn.addEventListener('mouseenter', () => {
                    // Position submenu to the right of parent
                    const btnRect = btn.getBoundingClientRect();
                    const menuRect = menu.getBoundingClientRect();
                    submenu.style.left = (btnRect.right - menuRect.left) + 'px';
                    submenu.style.top = (btn.offsetTop) + 'px';
                    submenu.style.display = 'block';
                });
                btn.addEventListener('mouseleave', () => {
                    setTimeout(() => {
                        if (!submenu.matches(':hover')) submenu.style.display = 'none';
                    }, 150);
                });
                submenu.addEventListener('mouseleave', () => {
                    submenu.style.display = 'none';
                });
            }
        });
        if (!parentMenu) this.container.appendChild(menu);
        return menu;
    }

    _bindEvents() {
        this.trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.show();
        });
        document.addEventListener('mousedown', (e) => {
            if (!this.menu.contains(e.target) && e.target !== this.trigger) {
                this._hideAllMenus();
            }
        });
    }

    _hideAllMenus() {
        // Hide all dropdown menus in the container
        const menus = this.container.querySelectorAll('.dropdown-menu');
        menus.forEach(menu => {
            menu.style.display = 'none';
        });
    }

    show() {
        const rect = this.trigger.getBoundingClientRect();
        this.menu.style.left = rect.left + 'px';
        this.menu.style.top = (rect.bottom + 4) + 'px';
        this.menu.style.display = 'block';
        // Hide any submenus
        const submenus = this.menu.querySelectorAll('.dropdown-menu');
        submenus.forEach(sub => sub.style.display = 'none');
    }

    hide() {
        this.menu.style.display = 'none';
    }

    destroy() {
        this.menu.remove();
    }
}

window.DropdownMenu = DropdownMenu;
