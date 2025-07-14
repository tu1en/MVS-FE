// Quick test to verify calendar fix
console.log('🔍 Testing Calendar Fix - Field Name Consistency');

// Mock event data with different field name variations
const mockEvents = [
    {
        id: 1,
        title: "Event with startDatetime",
        startDatetime: "2025-07-14T09:00:56",
        eventType: "EXAM"
    },
    {
        id: 2,
        title: "Event with start_datetime",
        start_datetime: "2025-07-14T10:00:56",
        eventType: "LECTURE"
    },
    {
        id: 3,
        title: "Event with startTime",
        startTime: "2025-07-14T11:00:56",
        eventType: "LAB"
    },
    {
        id: 4,
        title: "Event with no datetime",
        eventType: "MEETING"
    }
];

// Test the fixed getListData logic
const testGetListData = (events, targetDate) => {
    console.log(`\n🎯 Testing getListData for ${targetDate}:`);
    
    const dateEvents = events.filter(event => {
        // Check multiple possible field names for datetime (API inconsistency)
        const eventDateTime = event.startDatetime || event.start_datetime || event.startTime;
        
        if (!eventDateTime) {
            console.log(`  ❌ Event missing datetime: ${event.title}`);
            return false;
        }
        
        // Simple date comparison (without dayjs for this test)
        const eventDate = eventDateTime.split('T')[0]; // Extract YYYY-MM-DD
        const matches = eventDate === targetDate;
        
        console.log(`  🔍 ${event.title}: ${eventDateTime} -> ${eventDate} === ${targetDate} = ${matches}`);
        
        return matches;
    });
    
    console.log(`  ✅ Found ${dateEvents.length} events for ${targetDate}`);
    return dateEvents;
};

// Test for July 14, 2025
const july14Events = testGetListData(mockEvents, '2025-07-14');
console.log('\n📊 Final Results:');
console.log(`Events found for July 14, 2025: ${july14Events.length}`);
july14Events.forEach(event => {
    console.log(`  - ${event.title} (${event.eventType})`);
});

// Test for a date with no events
const july15Events = testGetListData(mockEvents, '2025-07-15');
console.log(`\nEvents found for July 15, 2025: ${july15Events.length}`);

console.log('\n✅ Calendar fix test completed!');
console.log('\n📝 Summary:');
console.log('- Fixed field name inconsistency: startDatetime || start_datetime || startTime');
console.log('- Added proper null checking for datetime fields');
console.log('- Events should now display consistently in both Month and Week view');
