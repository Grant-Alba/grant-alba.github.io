class StoryTimelineEditor {
    constructor() {
        this.scenes = [
            {
                id: 1,
                logline: "Hero discovers the ancient map in grandmother's attic",
                category: "Setup",
                time: null,
                stackIndex: 1
            },
            // ... other initial scenes
        ];
        
        this.categories = ['Setup', 'Plot Point', 'Action', 'Character', 'Climax'];
        this.zoomLevel = 2; // Start at weeks
        this.timelineOffset = 0;
        this.draggedScene = null;
        
        this.categoryColors = {
            'Setup': '#3B82F6',
            'Plot Point': '#EF4444',
            'Action': '#F59E0B',
            'Character': '#10B981',
            'Climax': '#8B5CF6'
        };
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEventListeners();
    }
    
    // Convert all the React functions to vanilla JS methods
    generateTimeLabel(position, zoom) {
        const unitIndex = Math.floor(position / 100);
        
        switch(zoom) {
            case 0: // Years
                return `YEAR:${2000 + unitIndex}`;
            case 1: // Months
                const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                const monthYear = 2000 + Math.floor(unitIndex / 12);
                const monthIndex = unitIndex % 12;
                return `MONTH:${monthNames[monthIndex]}-${monthYear}`;
            // ... other cases
        }
    }
    
    render() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="h-screen bg-gray-50 flex flex-col">
                <!-- Header -->
                <div class="bg-white border-b p-4 flex items-center justify-between">
                    <h1 class="text-2xl font-bold text-gray-800">Story Timeline Editor</h1>
                    <div class="flex items-center gap-4">
                        <!-- Zoom Controls -->
                        <div class="flex items-center gap-2">
                            <button id="zoom-out" class="p-2 rounded bg-blue-500 text-white">-</button>
                            <span id="zoom-label" class="text-sm font-medium min-w-[60px] text-center">WEEKS</span>
                            <button id="zoom-in" class="p-2 rounded bg-blue-500 text-white">+</button>
                        </div>
                        <!-- Export/Import -->
                        <button id="export-btn" class="px-3 py-2 bg-green-500 text-white rounded">Export</button>
                        <input type="file" id="import-file" class="hidden" accept=".md">
                        <button id="import-btn" class="px-3 py-2 bg-blue-500 text-white rounded">Import</button>
                    </div>
                </div>
                
                <!-- Timeline -->
                <div class="flex-1 bg-gray-100 overflow-hidden relative">
                    <div id="timeline" class="h-full relative"></div>
                </div>
                
                <!-- Scene Stack -->
                <div class="bg-white border-t p-4">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-700">Scene Stack</h3>
                        <button id="add-scene" class="px-3 py-2 bg-blue-500 text-white rounded">Add Scene</button>
                    </div>
                    <div id="scene-stack" class="min-h-[120px] bg-gray-100 rounded-lg p-4"></div>
                </div>
            </div>
        `;
        
        this.renderTimeline();
        this.renderSceneStack();
    }
    
    attachEventListeners() {
        // Add event listeners for buttons, drag/drop, etc.
        document.getElementById('zoom-out').addEventListener('click', () => {
            if (this.zoomLevel > 0) {
                this.zoomLevel--;
                this.updateZoomLabel();
                this.renderTimeline();
            }
        });
        
        document.getElementById('zoom-in').addEventListener('click', () => {
            if (this.zoomLevel < 4) {
                this.zoomLevel++;
                this.updateZoomLabel();
                this.renderTimeline();
            }
        });
        
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportToMarkdown();
        });
        
        // ... other event listeners
    }
    
    // ... rest of the methods converted to vanilla JS
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StoryTimelineEditor();
});
