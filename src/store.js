import create from "zustand";

let store = (set) => ({
    
    message: 'BUSD',
    paymentMessage: (initalize) => set({ 
        message: initalize.message, 
    }),
});

//store = devtools(store);
//store = persist(store, {name: 'user_setting'});
const useStore = create(store);
export default useStore;