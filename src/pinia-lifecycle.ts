
import { PiniaPlugin, type PiniaPluginContext } from "pinia";
import { useRoute, useRouter } from "vue-router";

declare module 'pinia' {
    export interface PiniaCustomProperties {
        init: () => void
    }

    export interface DefineStoreOptionsBase<S, Store> {
        lifecycle?: string[] | boolean
    }
}




export const piniaLifecycle: PiniaPlugin = ({ options, store }: PiniaPluginContext) => {
    const initEntries = Object.entries(store.$state);

    const route = useRoute()
    const initPath = route.path;
    const modules: string[] = []

    function checkPath(path: string) {
        return modules.some((module) => path == module || path == '/' + module || path.startsWith(module + '/') || path.startsWith('/' + module + '/'))
    }

    if (Array.isArray(options.lifecycle)) {
        modules.push(...options.lifecycle)
    }

    if (options.lifecycle == true) {
        modules.push(initPath)
    }

    if (modules.length > 0) {
        const router = useRouter()
        router.beforeEach((to, from) => {

            if (!checkPath(to.path)) {
                initEntries.forEach((entry) => {
                    store[entry[0]] = entry[1];
                });
            }
        })
    }

    return {
        init() {
            initEntries.forEach((entry) => {
                store[entry[0]] = entry[1];
            });
        },
    };
}
