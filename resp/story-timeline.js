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
            {
                id: 2,
                logline: "First encounter with the mysterious stranger at the tavern",
                category: "Plot Point",
                time: null,
                stackIndex: 2
            },
            {
                id: 3,
                logline: "The great battle at the bridge of shadows",
                category: "Action",
                time: null,
                stackIndex: 3
            }
        ];
        
        this.categories = ['Setup', 'Plot Point', 'Action', 'Character', 'Climax'];
        this.zoomLevel = 2; // 0: Years, 1: Months, 2: Weeks, 3: Days, 4: Hours
        this.timelineOffset = 0;
        this.draggedScene = null;
        this.showNewSceneForm = false;
        
        this.zoomLevels = ['YEARS', 'MONTHS', 'WEEKS', 'DAYS', 'HOURS'];
        
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
        this.attachEventListeners();
        this.renderCategories();
        this.renderTimeline();
        this.renderSceneStack();
        this.updateZoomLabel();
        this.updateZoomButtons();
    }
    
    attachEventListeners() {
        // Zoom controls
        document.getElementById('zoom-out').addEventListener('click', () => {
            if (this.zoomLevel > 0) {
                this.zoomLevel--;
                this.updateZoomLabel();
                this.updateZoomButtons();
                this.renderTimeline();
            }
        });
        
        document.getElementById('zoom-in').addEventListener('click', () => {
            if (this.zoomLevel < 4) {
                this.zoomLevel++;
                this.updateZoomLabel();
                this.updateZoomButtons();
                this.renderTimeline();
            }
        });
        
        // Navigation
        document.getElementById('nav-left').addEventListener('click', () => {
            this.timelineOffset += 200;
            this.renderTimeline();
        });
        
        document.getElementById('nav-right').addEventListener('click', () => {
            this.timelineOffset -= 200;
            this.renderTimeline();
        });
        
        // Import/Export
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportToMarkdown();
        });
        
        document.getElementById('import-btn').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });
        
        document.getElementById('import-file').addEventListener('change', (e) => {
            this.importFromMarkdown(e);
        });
        
        // Add scene
        document.getElementById('add-scene').addEventListener('click', () => {
            this.showAddSceneForm();
        });
        
        // Add category
        document.getElementById('add-category').addEventListener('click', () => {
            this.addNewCategory();
        });
        
        document.getElementById('new-category').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addNewCategory();
            }
        });
        
        // Timeline drag and drop
        const timeline = document.getElementById('timeline');
        timeline.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
        
        timeline.addEventListener('drop', (e) => {
            this.handleTimelineDrop(e);
        });
        
        // Stack drag and drop
        const stack = document.getElementById('scene-stack');
        stack.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
        
        stack.addEventListener('drop', (e) => {
            this.handleStackDrop(e);
        });
    }
    
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
            case 2: // Weeks
                const weekDate = new Date(2000, 0, 1 + unitIndex * 7);
                return `WEEK:${weekDate.getFullYear()}-${String(weekDate.getMonth() + 1).padStart(2, '0')}-${String(weekDate.getDate()).padStart(2, '0')}`;
            case 3: // Days
                const dayDate = new Date(2000, 0, 1 + unitIndex);
                return `DAY:${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
            case 4: // Hours
                const hourDay = Math.floor(unitIndex / 24);
                const hour = unitIndex % 24;
                const hourDate = new Date(2000, 0, 1 + hourDay);
                const hourLabel = hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`;
                return `HOUR:${hourDate.getFullYear()}-${String(hourDate.getMonth() + 1).padStart(2, '0')}-${String(hourDate.getDate()).padStart(2, '0')} ${hourLabel}`;
            default:
                return `YEAR:${2000 + unitIndex}`;
        }
    }
    
    parseTimeToPosition(timeStr) {
        if (!timeStr) return 0;
        
        const baseDate = new Date(2000, 0, 1);
        let targetDate;
        
        // Convert time string to actual date
        if (timeStr.startsWith('YEAR:')) {
            const year = parseInt(timeStr.split(':')[1]);
            targetDate = new Date(year, 0, 1);
        } else if (timeStr.startsWith('MONTH:')) {
            const [month, year] = timeStr.split(':')[1].split('-');
            const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const monthIndex = monthNames.indexOf(month);
            targetDate = new Date(parseInt(year), monthIndex, 1);
        } else if (timeStr.startsWith('WEEK:')) {
            const dateStr = timeStr.split(':')[1];
            const [year, month, day] = dateStr.split('-').map(Number);
            targetDate = new Date(year, month - 1, day);
        } else if (timeStr.startsWith('DAY:')) {
            const dateStr = timeStr.split(':')[1];
            const [year, month, day] = dateStr.split('-').map(Number);
            targetDate = new Date(year, month - 1, day);
        } else if (timeStr.startsWith('HOUR:')) {
            const [datePart, timePart] = timeStr.split(':')[1].split(' ');
            const [year, month, day] = datePart.split('-').map(Number);
            targetDate = new Date(year, month - 1, day);
            
            if (timePart) {
                let hour = 0;
                if (timePart.includes('am') || timePart.includes('pm')) {
                    const hourNum = parseInt(timePart);
                    const isAM = timePart.includes('am');
                    hour = isAM ? (hourNum === 12 ? 0 : hourNum) : (hourNum === 12 ? 12 : hourNum + 12);
                }
                targetDate = new Date(targetDate.getTime() + hour * 60 * 60 * 1000);
            }
        } else {
            return 0;
        }
        
        // Calculate viewport position based on current zoom level
        switch(this.zoomLevel) {
            case 0: // Years zoom
                const yearsDiff = targetDate.getFullYear() - 2000;
                return yearsDiff * 100;
            case 1: // Months zoom
                const totalMonths = (targetDate.getFullYear() - 2000) * 12 + targetDate.getMonth();
                return totalMonths * 100;
            case 2: // Weeks zoom
                const daysDiff = (targetDate - baseDate) / (24 * 60 * 60 * 1000);
                const weeksDiff = Math.floor(daysDiff / 7);
                return weeksDiff * 100;
            case 3: // Days zoom
                const daysDiffDays = (targetDate - baseDate) / (24 * 60 * 60 * 1000);
                return Math.floor(daysDiffDays) * 100;
            case 4: // Hours zoom
                const hoursDiff = (targetDate - baseDate) / (60 * 60 * 1000);
                return Math.floor(hoursDiff) * 100;
            default:
                return 0;
        }
    }
    
    getVisibleTimelineScenes() {
        const timelineScenes = this.scenes.filter(scene => scene.stackIndex === 0 && scene.time);
        
        // Group by time type
        const scenesByType = {
            YEAR: timelineScenes.filter(scene => scene.time.startsWith('YEAR:')),
            MONTH: timelineScenes.filter(scene => scene.time.startsWith('MONTH:')),
            WEEK: timelineScenes.filter(scene => scene.time.startsWith('WEEK:')),
            DAY: timelineScenes.filter(scene => scene.time.startsWith('DAY:')),
            HOUR: timelineScenes.filter(scene => scene.time.startsWith('HOUR:'))
        };
        
        // Determine visible types based on zoom level
        let visibleTypes = [];
        switch(this.zoomLevel) {
            case 0: visibleTypes = ['YEAR']; break;
            case 1: visibleTypes = ['YEAR', 'MONTH']; break;
            case 2: visibleTypes = ['YEAR', 'MONTH', 'WEEK']; break;
            case 3: visibleTypes = ['YEAR', 'MONTH', 'WEEK', 'DAY']; break;
            case 4: visibleTypes = ['YEAR', 'MONTH', 'WEEK', 'DAY', 'HOUR']; break;
            default: visibleTypes = ['YEAR'];
        }
        
        return visibleTypes.map((type, rowIndex) => ({
            type,
            rowIndex,
            scenes: scenesByType[type] || []
        }));
    }
    
    renderTimeline() {
        const timeline = document.getElementById('timeline');
        timeline.innerHTML = '';
        
        // Render timeline markers
        this.renderTimelineMarkers();
        
        // Get visible scene rows
        const timelineRows = this.getVisibleTimelineScenes();
        
        // Render row labels
        timelineRows.forEach((row, index) => {
            const label = document.createElement('div');
            label.className = 'row-label';
            label.style.top = `${60 + index * 120}px`;
            label.textContent = `${row.type}S`;
            timeline.appendChild(label);
        });
        
        // Render scene cards
        timelineRows.forEach((row) => {
            row.scenes.forEach(scene => {
                const position = this.parseTimeToPosition(scene.time);
                const rowTop = 60 + row.rowIndex * 120;
                
                const card = document.createElement('div');
                card.className = 'timeline-card';
                card.draggable = true;
                card.style.left = `${position - this.timelineOffset}px`;
                card.style.top = `${rowTop}px`;
                card.style.borderLeft = `4px solid ${this.categoryColors[scene.category] || '#6B7280'}`;
                
                card.innerHTML = `
                    <div class="flex items-start justify-between gap-2">
                        <div class="flex-1">
                            <p class="text-sm font-medium text-gray-800 leading-tight">
                                ${scene.logline}
                            </p>
                            <div class="flex items-center gap-2 mt-2">
                                <span class="category-badge" style="background-color: ${this.categoryColors[scene.category] || '#6B7280'}">
                                    ${scene.category}
                                </span>
                                <span class="text-xs text-gray-500">
                                    ${scene.time}
                                </span>
                                <span class="text-xs text-blue-600 font-medium">
                                    ${row.type}
                                </span>
                            </div>
                        </div>
                    </div>
                `;
                
                card.addEventListener('dragstart', (e) => {
                    this.draggedScene = scene;
                    e.dataTransfer.effectAllowed = 'move';
                });
                
                timeline.appendChild(card);
            });
        });
    }
    
    renderTimelineMarkers() {
        const timeline = document.getElementById('timeline');
        const markerSpacing = 100;
        const startPosition = Math.floor(this.timelineOffset / markerSpacing) * markerSpacing;
        const endPosition = startPosition + window.innerWidth + markerSpacing * 2;
        
        for (let pos = startPosition; pos <= endPosition; pos += markerSpacing) {
            let timeLabel = '';
            const unitIndex = Math.floor(pos / markerSpacing);
            
            switch(this.zoomLevel) {
                case 0: // Years
                    timeLabel = (2000 + unitIndex).toString();
                    break;
                case 1: // Months
                    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                    const monthYear = 2000 + Math.floor(unitIndex / 12);
                    const monthIndex = unitIndex % 12;
                    timeLabel = `${monthNames[monthIndex]} ${monthYear}`;
                    break;
                case 2: // Weeks
                    const weekDate = new Date(2000, 0, 1 + unitIndex * 7);
                    timeLabel = `${weekDate.getMonth() + 1}/${weekDate.getDate()}/${weekDate.getFullYear()}`;
                    break;
                case 3: // Days
                    const dayDate = new Date(2000, 0, 1 + unitIndex);
                    timeLabel = `${dayDate.getMonth() + 1}/${dayDate.getDate()}/${dayDate.getFullYear()}`;
                    break;
                case 4: // Hours
                    const hourDay = Math.floor(unitIndex / 24);
                    const hour = unitIndex % 24;
                    const hourDate = new Date(2000, 0, 1 + hourDay);
                    const hourLabel = hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`;
                    timeLabel = `${hourDate.getMonth() + 1}/${hourDate.getDate()} ${hourLabel}`;
                    break;
                default:
                    timeLabel = (2000 + unitIndex).toString();
            }
            
            const marker = document.createElement('div');
            marker.className = 'timeline-marker';
            marker.style.left = `${pos - this.timelineOffset}px`;
            marker.innerHTML = `<span>${timeLabel}</span>`;
            
            timeline.appendChild(marker);
        }
    }
    
    renderSceneStack() {
        const stack = document.getElementById('scene-stack');
        const stackScenes = this.scenes
            .filter(scene => scene.stackIndex > 0)
            .sort((a, b) => a.stackIndex - b.stackIndex);
        
        stack.innerHTML = '';
        
        if (stackScenes.length === 0) {
            stack.innerHTML = `
                <div class="flex items-center justify-center h-full text-gray-500">
                    No scenes in stack. Add a new scene or drag scenes here from the timeline.
                </div>
            `;
            return;
        }
        
        stackScenes.forEach((scene, index) => {
            const card = document.createElement('div');
            card.className = 'stack-card';
            card.style.left = `${index * 4}px`;
            card.style.top = `${index * 4}px`;
            card.style.borderLeft = `4px solid ${this.categoryColors[scene.category] || '#6B7280'}`;
            card.style.opacity = index === 0 ? '1' : `${0.7 - index * 0.1}`;
            card.style.zIndex = stackScenes.length - index;
            
            if (index === 0) {
                card.draggable = true;
                card.addEventListener('dragstart', (e) => {
                    this.draggedScene = scene;
                    e.dataTransfer.effectAllowed = 'move';
                });
                
                card.addEventListener('dblclick', () => {
                    this.handleStackDoubleClick();
                });
            }
            
            card.innerHTML = `
                <p class="text-sm font-medium text-gray-800 leading-tight">
                    ${scene.logline}
                </p>
                <div class="flex items-center gap-2 mt-2">
                    <span class="category-badge" style="background-color: ${this.categoryColors[scene.category] || '#6B7280'}">
                        ${scene.category}
                    </span>
                    ${index === 0 ? '<span class="text-xs text-blue-600 font-medium">Double-click to cycle</span>' : ''}
                </div>
            `;
            
            stack.appendChild(card);
        });
    }
    
    renderCategories() {
        const categoriesList = document.getElementById('categories-list');
        categoriesList.innerHTML = '';
        
        this.categories.forEach(cat => {
            const badge = document.createElement('span');
            badge.className = 'category-badge';
            badge.style.backgroundColor = this.categoryColors[cat] || '#6B7280';
            badge.textContent = cat;
            categoriesList.appendChild(badge);
        });
    }
    
    updateZoomLabel() {
        document.getElementById('zoom-label').textContent = this.zoomLevels[this.zoomLevel];
    }
    
    updateZoomButtons() {
        document.getElementById('zoom-out').disabled = this.zoomLevel === 0;
        document.getElementById('zoom-in').disabled = this.zoomLevel === 4;
    }
    
    handleTimelineDrop(e) {
        e.preventDefault();
        if (!this.draggedScene) return;
        
        const rect = document.getElementById('timeline').getBoundingClientRect();
        const dropX = e.clientX - rect.left + this.timelineOffset;
        const timeLabel = this.generateTimeLabel(dropX, this.zoomLevel);
        
        this.scenes = this.scenes.map(scene => 
            scene.id === this.draggedScene.id 
                ? { ...scene, time: timeLabel, stackIndex: 0 }
                : scene
        );
        
        this.draggedScene = null;
        this.renderTimeline();
        this.renderSceneStack();
    }
    
    handleStackDrop(e) {
        e.preventDefault();
        if (!this.draggedScene) return;
        
        const maxStackIndex = Math.max(...this.scenes.filter(s => s.stackIndex > 0).map(s => s.stackIndex), 0);
        
        this.scenes = this.scenes.map(scene => 
            scene.id === this.draggedScene.id 
                ? { ...scene, time: null, stackIndex: maxStackIndex + 1 }
                : scene
        );
        
        this.draggedScene = null;
        this.renderTimeline();
        this.renderSceneStack();
    }
    
    handleStackDoubleClick() {
        const stackScenes = this.scenes.filter(scene => scene.stackIndex > 0).sort((a, b) => a.stackIndex - b.stackIndex);
        if (stackScenes.length === 0) return;
        
        const topScene = stackScenes[0];
        const maxStackIndex = Math.max(...stackScenes.map(s => s.stackIndex));
        
        this.scenes = this.scenes.map(scene => {
            if (scene.id === topScene.id) {
                return { ...scene, stackIndex: maxStackIndex + 1 };
            }
            if (scene.stackIndex > 1) {
                return { ...scene, stackIndex: scene.stackIndex - 1 };
            }
            return scene;
        });
        
        this.renderSceneStack();
    }
    
    showAddSceneForm() {
        const overlay = document.createElement('div');
        overlay.className = 'form-overlay';
        overlay.innerHTML = `
            <div class="form-modal">
                <h3 class="text-lg font-semibold mb-4">Add New Scene</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Logline:</label>
                        <input type="text" id="scene-logline" placeholder="Scene logline..." class="w-full px-3 py-2 border rounded">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Category:</label>
                        <select id="scene-category" class="w-full px-3 py-2 border rounded">
                            ${this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                        </select>
                    </div>
                    <div class="flex gap-2">
                        <button id="add-scene-confirm" class="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Add</button>
                        <button id="add-scene-cancel" class="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        const loglineInput = document.getElementById('scene-logline');
        loglineInput.focus();
        
        document.getElementById('add-scene-confirm').addEventListener('click', () => {
            this.addNewScene();
            document.body.removeChild(overlay);
        });
        
        document.getElementById('add-scene-cancel').addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        
        loglineInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addNewScene();
                document.body.removeChild(overlay);
            }
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }
    
    addNewScene() {
        const logline = document.getElementById('scene-logline')?.value.trim();
        const category = document.getElementById('scene-category')?.value || this.categories[0];
        
        if (!logline) return;
        
        const maxId = Math.max(...this.scenes.map(s => s.id), 0);
        const maxStackIndex = Math.max(...this.scenes.filter(s => s.stackIndex > 0).map(s => s.stackIndex), 0);
        
        this.scenes.push({
            id: maxId + 1,
            logline: logline,
            category: category,
            time: null,
            stackIndex: maxStackIndex + 1
        });
        
        this.renderSceneStack();
    }
    
    addNewCategory() {
        const input = document.getElementById('new-category');
        const newCategory = input.value.trim();
        
        if (!newCategory || this.categories.includes(newCategory)) {
            input.value = '';
            return;
        }
        
        this.categories.push(newCategory);
        input.value = '';
        this.renderCategories();
    }
    
    exportToMarkdown() {
        try {
            let markdown = '# Story Timeline\n\n';
            
            this.scenes.forEach(scene => {
                markdown += '## SCENE:\n';
                markdown += `#LOGLINE: ${scene.logline}\n`;
                markdown += `#TIME: ${scene.time || 'UNSET'}\n`;
                markdown += `#CATEGORY: ${scene.category}\n`;
                markdown += `#STACK INDEX: ${scene.stackIndex}\n\n`;
            });

            const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
            
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                // IE/Edge
                window.navigator.msSaveOrOpenBlob(blob, 'story-timeline.md');
            } else {
                // Modern browsers
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'story-timeline.md';
                link.style.display = 'none';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                setTimeout(() => URL.revokeObjectURL(url), 100);
            }
        } catch (error) {
            // Fallback: copy to clipboard
            let markdown = '# Story Timeline\n\n';
            
            this.scenes.forEach(scene => {
                markdown += '## SCENE:\n';
                markdown += `#LOGLINE: ${scene.logline}\n`;
                markdown += `#TIME: ${scene.time || 'UNSET'}\n`;
                markdown += `#CATEGORY: ${scene.category}\n`;
                markdown += `#STACK INDEX: ${scene.stackIndex}\n\n`;
            });
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(markdown).then(() => {
                    alert('Export failed, but content copied to clipboard! Paste into a text file and save as .md');
                }).catch(() => {
                    alert('Export failed. Please check browser security settings or try a different browser.');
                });
            } else {
                alert('Export failed. Please check browser security settings or try a different browser.');
            }
        }
    }
    
    importFromMarkdown(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const sceneBlocks = content.split('## SCENE:').filter(block => block.trim());
                
                const importedScenes = sceneBlocks.map((block, index) => {
                    const lines = block.split('\n').filter(line => line.trim());
                    const scene = { id: index + 1 };
                    
                    lines.forEach(line => {
                        if (line.startsWith('#LOGLINE:')) {
                            scene.logline = line.replace('#LOGLINE:', '').trim();
                        } else if (line.startsWith('#TIME:')) {
                            const time = line.replace('#TIME:', '').trim();
                            scene.time = time === 'UNSET' ? null : time;
                        } else if (line.startsWith('#CATEGORY:')) {
                            scene.category = line.replace('#CATEGORY:', '').trim();
                        } else if (line.startsWith('#STACK INDEX:')) {
                            scene.stackIndex = parseInt(line.replace('#STACK INDEX:', '').trim());
                        }
                    });
                    
                    return scene;
                });

                // Update categories based on imported scenes
                const importedCategories = [...new Set(importedScenes.map(s => s.category))];
                this.categories = [...new Set([...this.categories, ...importedCategories])];
                
                this.scenes = importedScenes;
                
                this.renderCategories();
                this.renderTimeline();
                this.renderSceneStack();
                
                alert('Timeline imported successfully!');
            } catch (error) {
                alert('Error importing file. Please check the file format.');
            }
        };
        
        reader.readAsText(file);
        event.target.value = '';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StoryTimelineEditor();
});