interface MainStoreState {
    loading: boolean
    dark: boolean
    _basePath: string
    size: {
        innerHeight: number
        innerWidth: number
    }
}

export const useMainStore = defineStore('main', {
    state: (): MainStoreState => ({
        loading: true,
        dark: false,
        _basePath: '',
        size: {
            innerHeight: 0,
            innerWidth: 0
        }
    }),
    getters: {
        basePath(): string {
            return this._basePath
        }
    },
    actions: {
        updateDarkMode(dark: boolean) {
            this.dark = dark
        },
        updateValue<T extends keyof MainStoreState>(k: T, v: MainStoreState[T]) {
            this.$state[k] = v
        },
        updateSize() {
            if (typeof window === 'undefined') {
                return
            }
            this.size.innerHeight = window.innerHeight
            this.size.innerWidth = window.innerWidth
        }
    }
})
