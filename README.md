**Weather Display Solution for National Trust Properties**  
*(Non-Technical Overview)*  

**What It Does**  
This solution adds weather information to National Trust property pages to help visitors plan their trips. It automatically tests whether showing the weather increases visits.  

---

**Key Features**  
✅ **Automatic Weather Updates**  
- Shows current temperature and weather conditions  
- Displays a 12-hour forecast  
- Matches the National Trust website’s design  

✅ **Reliable Performance**  
- Works even if weather data is unavailable (Error Zones)
- Doesn’t slow down the website  
- Updates weather every 30 minutes  

✅ **Easy to Use**  
- No changes needed to existing website  
- Automatically appears on property pages  

---

**How It Helps**  
- **Visitors**: Make informed decisions about when to visit.  
- **National Trust**: Understand if weather displays boost visits.  
- **Technical Team**: Simple "plug-in" solution requiring no maintenance.  

---

**What Visitors See**  
A weather section appears below the "Get here" area, showing:  
☀️ Current temperature and conditions (e.g., "18°C Sunny")  
⏱️ Next 12-hour forecast with icons and rain chances  

---

**Why It Works**  
- Uses trusted weather data  
- Blends naturally with existing page content  
- Respects visitor privacy (no personal data collected)  

(Due to technical issues, the search service is temporarily unavailable.)

Here's a clear **README section** for running the code as a Chrome snippet:

---

## 🚀 How to Run (Chrome Snippet)

This script can be easily injected into any National Trust property page using Chrome DevTools Snippets. Follow these steps:

### **Prerequisites**
- Google Chrome browser
- Access to a National Trust [`Property Page`](https://www.nationaltrust.org.uk/visit/warwickshire/packwood-house)

---

### **Step-by-Step Guide**

1. **Open Chrome DevTools**  
   - Navigate to the National Trust property page  
   - Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Opt+I` (Mac)  

2. **Go to Snippets**  
   - In DevTools, click the **Sources** tab  
   - Select **Snippets** in the left panel  
   - Click `+ New Snippet`  

3. **Paste the Code**  
   - Copy the entire code from [`weather-widget.js`](weather-widget.js)  
   - Paste it into the new snippet file  
   - Press `Ctrl+S`/`Cmd+S` to save  

4. **Run the Snippet**  
   - Right-click the snippet name  
   - Select **Run**  
   - The weather widget will appear below the "Getting here" section  
---

<img width="1156" alt="Screenshot 2025-03-05 at 00 12 33" src="https://github.com/user-attachments/assets/09e10065-0672-45b9-826b-92b976bfa6c5" />

**Next Steps** 
Add A/B testing (commented sample code available) where:
- 50% of visitors see the weather (test group) 
- 50% see the normal page (control group)  
- Measures if weather displays lead to more visits (Conversion rate)

This solution helps the National Trust enhance visitor experience while gathering data to confirm if weather displays drive engagement.
