// Debug script to test calendar date filtering logic
const dayjs = require('dayjs');

console.log('🔍 DEBUG: Calendar Event Filtering Issue\n');

// Mock event data from API (same as what we see in browser)
const mockEvents = [
    {
        id: 4,
        title: "Mathematics Midterm Exam",
        startDatetime: "2025-07-14T09:00:56",
        endDatetime: "2025-07-14T11:00:56",
        eventType: "EXAM",
        location: "Exam Hall A",
        classroomId: 1,
        classroomName: "Toán cao cấp A1"
    }
];

console.log('📋 Mock Events:', JSON.stringify(mockEvents, null, 2));

// Test the exact getListData logic from TimetableView
const getListData = (value, events) => {
    console.log('\n🔍 getListData called with:');
    console.log('  value (dayjs):', value.format('YYYY-MM-DD'));
    console.log('  events array length:', events.length);
    
    if (!Array.isArray(events) || events.length === 0) {
        console.log('  ❌ Events array is empty or not array');
        return [];
    }

    const dateEvents = events.filter(event => {
        if (!event.startDatetime) {
            console.log('  ❌ Event has no startDatetime:', event.title);
            return false;
        }
        
        const eventDate = dayjs(event.startDatetime).format('YYYY-MM-DD');
        const valueDate = value.format('YYYY-MM-DD');
        
        console.log(`  🔍 Comparing: ${eventDate} === ${valueDate} = ${eventDate === valueDate}`);
        console.log(`    Event: "${event.title}"`);
        
        return eventDate === valueDate;
    });

    console.log('  ✅ Filtered events:', dateEvents.length);
    
    const result = dateEvents.map(event => ({
        type: 'error', // Assuming EXAM type maps to 'error'
        content: event.title || 'Không có tiêu đề',
        event: event
    }));
    
    console.log('  📋 Final result:', result);
    return result;
};

// Test for July 14, 2025
console.log('\n🎯 Testing for July 14, 2025:');
const july14 = dayjs('2025-07-14');
console.log('July 14 dayjs object:', july14.format('YYYY-MM-DD HH:mm:ss'));

const result = getListData(july14, mockEvents);
console.log('\n📊 Final Result:');
console.log('  Length:', result.length);
console.log('  Data:', JSON.stringify(result, null, 2));

// Test edge cases
console.log('\n🧪 Testing Edge Cases:');

// Test with different date formats
const testDates = [
    dayjs('2025-07-14'),
    dayjs('2025-07-14T00:00:00'),
    dayjs('2025-07-14T09:00:56'),
    dayjs('2025-07-14T23:59:59')
];

testDates.forEach((date, index) => {
    console.log(`\nTest ${index + 1}: ${date.format('YYYY-MM-DD HH:mm:ss')}`);
    const testResult = getListData(date, mockEvents);
    console.log(`  Result length: ${testResult.length}`);
});

// Test timezone issues
console.log('\n🌍 Testing Timezone:');
const event = mockEvents[0];
const eventDayjs = dayjs(event.startDatetime);
console.log('Event startDatetime:', event.startDatetime);
console.log('Parsed by dayjs:', eventDayjs.format('YYYY-MM-DD HH:mm:ss'));
console.log('UTC offset:', eventDayjs.utcOffset());
console.log('Is valid:', eventDayjs.isValid());

// Test the actual browser scenario
console.log('\n🌐 Testing Browser Scenario:');
console.log('Current system date:', new Date().toISOString());
console.log('Current dayjs():', dayjs().format('YYYY-MM-DD HH:mm:ss'));

// Test if the issue is with the events array being empty
console.log('\n📋 Testing Empty Events Array:');
const emptyResult = getListData(july14, []);
console.log('Empty array result:', emptyResult);

const nullResult = getListData(july14, null);
console.log('Null array result:', nullResult);

const undefinedResult = getListData(july14, undefined);
console.log('Undefined array result:', undefinedResult);

console.log('\n✅ Debug complete!');
