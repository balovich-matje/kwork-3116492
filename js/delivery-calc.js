/**
 * Delivery Calculator Module
 * Handles standalone delivery calculator on delivery page
 */

document.addEventListener('DOMContentLoaded', () => {
    const calcBtn = document.getElementById('calcButton');
    if (calcBtn) {
        calcBtn.addEventListener('click', calculateDeliveryCost);
    }
});

function calculateDeliveryCost() {
    const distance = parseFloat(document.getElementById('calcDistance').value) || 0;
    const floor = parseInt(document.getElementById('calcFloor').value) || 1;
    const hasElevator = document.getElementById('calcElevator').checked;
    const category = document.getElementById('calcCategory').value;
    const needAssembly = document.getElementById('calcAssembly').checked;
    
    if (distance <= 0) {
        alert('Пожалуйста, укажите расстояние');
        return;
    }
    
    const deliverySettings = DataManager.getDeliverySettings();
    const zones = deliverySettings.zones || [];
    const floorSettings = deliverySettings.floorPrices || {};
    const assemblyPrices = deliverySettings.assembly || {};
    
    // Calculate delivery cost
    let deliveryCost = 0;
    for (const zone of zones) {
        if (distance <= zone.maxDistance) {
            deliveryCost = zone.basePrice + (distance * zone.pricePerKm);
            break;
        }
    }
    
    // If distance is greater than all zones, use the last zone
    if (deliveryCost === 0 && zones.length > 0) {
        const lastZone = zones[zones.length - 1];
        deliveryCost = lastZone.basePrice + (distance * lastZone.pricePerKm);
    }
    
    // Calculate floor cost
    let floorCost = 0;
    if (!hasElevator) {
        const baseFloor = floorSettings.withoutElevator?.baseFloor || 3;
        const pricePerFloor = floorSettings.withoutElevator?.perFloor || 200;
        if (floor > baseFloor) {
            floorCost = (floor - baseFloor) * pricePerFloor;
        }
    }
    
    // Calculate assembly cost
    let assemblyCost = 0;
    if (needAssembly && category) {
        const categoryMap = {
            'refrigerator': 'refrigerator',
            'washingMachine': 'washingMachine',
            'dishwasher': 'dishwasher',
            'oven': 'oven',
            'microwave': 'microwave',
            'vacuumCleaner': 'vacuumCleaner'
        };
        assemblyCost = assemblyPrices[categoryMap[category]] || 0;
    }
    
    // Display results
    const resultDiv = document.getElementById('calcResult');
    if (resultDiv) {
        resultDiv.style.display = 'block';
        document.getElementById('resultDelivery').textContent = formatPrice(deliveryCost);
        
        const floorRow = document.getElementById('resultFloorRow');
        if (floorRow) {
            floorRow.style.display = floorCost > 0 ? 'flex' : 'none';
            document.getElementById('resultFloor').textContent = formatPrice(floorCost);
        }
        
        const assemblyRow = document.getElementById('resultAssemblyRow');
        if (assemblyRow) {
            assemblyRow.style.display = assemblyCost > 0 ? 'flex' : 'none';
            document.getElementById('resultAssembly').textContent = formatPrice(assemblyCost);
        }
        
        document.getElementById('resultTotal').textContent = formatPrice(deliveryCost + floorCost + assemblyCost);
    }
}
