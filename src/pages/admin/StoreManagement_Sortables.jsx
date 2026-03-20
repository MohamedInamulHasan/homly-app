
// Sortable Store Card Component
const SortableStoreCard = ({ store, children }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: store.id || store._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none' // Prevent scrolling while dragging on touch devices
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
};

// Sortable Product Row Component
const SortableProductRow = ({ product, children }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: product.id || product._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 'auto',
        position: 'relative',
        touchAction: 'none'
    };

    return (
        <tr ref={setNodeRef} style={style} {...attributes} {...listeners} className={`${isDragging ? 'bg-blue-50 dark:bg-blue-900/30 shadow-lg' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'} transition-colors`}>
            {children}
        </tr>
    );
};
