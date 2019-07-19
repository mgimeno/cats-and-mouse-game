
export class CommonHelper {

    public static moveArrayItem(array: any[], fromIndex: number, toIndex: number): void {
        
        let elementToMove = array[fromIndex];
        array.splice(fromIndex, 1);
        array.splice(toIndex, 0, elementToMove);
        
    }
}