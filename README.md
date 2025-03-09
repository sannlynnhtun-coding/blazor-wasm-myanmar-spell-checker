# Building a Myanmar Spell Checker with Blazor WebAssembly, .NET 8, and Preline Tailwind CSS

## Step 1: Set Up Your Development Environment

Before we start, ensure you have the following installed:
- **.NET 8 SDK**: Download it from [Microsoft's .NET site](https://dotnet.microsoft.com/download/dotnet/8.0).
- **Visual Studio 2022** (or later) or a code editor like VS Code.
- **Node.js**: Required for Tailwind CSS and Preline setup (download from [nodejs.org](https://nodejs.org/)).

Verify your .NET installation by running:
```bash
dotnet --version
```
You should see `8.0.xxx` (exact version may vary).

---

## Step 2: Create a New Blazor WebAssembly Project

1. **Open a Terminal or Command Prompt**:
   - Navigate to the folder where you want your project.

2. **Create the Project**:
   Run the following command to create a new Blazor WebAssembly app:
   ```bash
   dotnet new blazorwasm -n MyanmarSpellChecker
   cd MyanmarSpellChecker
   ```
   This creates a basic Blazor WebAssembly project targeting .NET 8.

3. **Run the App**:
   Test the default app:
   ```bash
   dotnet run
   ```
   Open your browser to `https://localhost:5001` (or the port shown in the terminal). You’ll see the default Blazor template.

---

## Step 3: Install Preline and Tailwind CSS

Preline is a UI library that uses Tailwind CSS for styling. Let’s integrate it into our project.

1. **Install Node.js Dependencies**:
   - In your project folder, initialize a `package.json` file:
     ```bash
     npm init -y
     ```
   - Install Tailwind CSS and Preline:
     ```bash
     npm install tailwindcss preline --save-dev
     ```

2. **Set Up Tailwind CSS**:
   - Create a `tailwind.config.js` file in the root:
     ```bash
     npx tailwindcss init
     ```
   - Update `tailwind.config.js` to include Preline and your project files:
     ```javascript
     /** @type {import('tailwindcss').Config} */
     module.exports = {
       content: [
         './wwwroot/**/*.{html,cshtml,razor}',
         './**/*.razor',
         './node_modules/preline/dist/*.js',
       ],
       theme: {
         extend: {},
       },
       plugins: [
         require('preline/plugin'),
       ],
     }
     ```

3. **Create a CSS File**:
   - In the `wwwroot/css` folder, create a file named `app.css` (or modify the existing one) with:
     ```css
     @tailwind base;
     @tailwind components;
     @tailwind utilities;

     /* Add custom styles if needed */
     ```

4. **Build Tailwind CSS**:
   - Add a build script to `package.json`:
     ```json
     "scripts": {
       "build:css": "npx tailwindcss -i ./wwwroot/css/app.css -o ./wwwroot/css/app.min.css --minify"
     }
     ```
   - Run the script:
     ```bash
     npm run build:css
     ```
   - This generates a minified `app.min.css` file in `wwwroot/css`.

5. **Link CSS and Preline JS**:
   - Open `wwwroot/index.html` and update the `<head>` section:
     ```html
     <link href="/css/app.min.css" rel="stylesheet" />
     <script src="https://unpkg.com/preline@2.0.3/dist/preline.min.js" defer></script>
     ```
   - Preline requires initializing its JS components, which we’ll handle later.

---

## Step 4: Design the UI Structure

Our spell checker will have two pages:
1. **API Key Input Page**: To enter the Gemini API key.
2. **Spell Check Page**: To input Myanmar text and display corrections.

1. **Update `Program.cs`**:
   - Ensure the `HttpClient` is available by adding it to the services:
     ```csharp
     builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });
     ```

2. **Create an API Key Service**:
   - Add a new file `Services/ApiKeyService.cs`:
     ```csharp
     namespace MyanmarSpellChecker.Services;

     public class ApiKeyService
     {
         public string ApiKey { get; set; } = string.Empty;
     }
     ```
   - Register it in `Program.cs`:
     ```csharp
     builder.Services.AddSingleton<ApiKeyService>();
     ```

3. **Modify the Main Page**:
   - Open `Pages/Index.razor` and replace its content with the UI from your provided code (or use the simplified version below for now):
     ```razor
     @page "/"
     @inject ApiKeyService ApiKeyService
     @inject NavigationManager Navigation
     @inject HttpClient Http
     @inject IJSRuntime JSRuntime

     <div class="relative overflow-hidden">
         <div class="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-24">
             <div class="text-center">
                 @if (enumPage == EnumPage.FirstPage)
                 {
                     <h1 class="text-4xl font-bold text-gray-800 dark:text-neutral-200">
                         API Key ထည့်သွင်းပါ
                     </h1>
                     <p class="mt-3 text-gray-600 dark:text-neutral-400">
                         Gemini API ကိုအသုံးပြုရန် သင်၏ API Key ကိုထည့်ပါ။
                     </p>
                     <div class="mt-7 mx-auto max-w-xl">
                         <input type="text" @bind="ApiKey" placeholder="API Key ထည့်သွင်းပါ"
                                class="py-2.5 px-4 w-full border rounded-lg dark:bg-neutral-900 dark:text-neutral-400" />
                         <button @onclick="SaveApiKey" class="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg">
                             သိမ်းမည်
                         </button>
                     </div>
                 }
                 else if (enumPage == EnumPage.SecondPage)
                 {
                     <h1 class="text-4xl font-bold text-gray-800 dark:text-neutral-200">
                         မြန်မာစာလုံးပေါင်းစစ်ဆေးခြင်း
                     </h1>
                     <p class="mt-3 text-gray-600 dark:text-neutral-400">
                         သင်၏မြန်မာစာသားကို စစ်ဆေးပြီး ပြင်ဆင်ချက်များကိုကြည့်ပါ။
                     </p>
                     <div class="mt-7 mx-auto max-w-xl">
                         <textarea @bind="InputText" rows="5" placeholder="စာသားထည့်ပါ"
                                   class="py-2.5 px-4 w-full border rounded-lg dark:bg-neutral-900 dark:text-neutral-400"></textarea>
                         <div class="mt-3 flex justify-end gap-3">
                             <button @onclick="GoBack" class="px-4 py-2 border rounded-lg text-gray-800">
                                 နောက်သို့
                             </button>
                             <button @onclick="CheckSpelling" class="px-4 py-2 bg-blue-600 text-white rounded-lg">
                                 စစ်ဆေးမည်
                             </button>
                         </div>
                         <div class="mt-4 text-gray-700 dark:text-neutral-400">
                             <p>ပြင်ဆင်ပြီးစာသား: <code>@CorrectedText</code></p>
                             @if (!string.IsNullOrEmpty(Corrections))
                             {
                                 <p>ပြင်ဆင်ခဲ့သည်များ: @Corrections</p>
                             }
                         </div>
                     </div>
                 }
             </div>
         </div>
     </div>

     @code {
         private string InputText { get; set; } = string.Empty;
         private string CorrectedText { get; set; } = string.Empty;
         private string Corrections { get; set; } = string.Empty;
         private string ApiKey { get; set; } = string.Empty;
         private EnumPage enumPage = EnumPage.FirstPage;

         public enum EnumPage { FirstPage, SecondPage }

         protected override async Task OnAfterRenderAsync(bool firstRender)
         {
             if (firstRender)
             {
                 await JSRuntime.InvokeVoidAsync("HS.init"); // Initialize Preline
             }
         }

         private void SaveApiKey()
         {
             if (!string.IsNullOrEmpty(ApiKey))
             {
                 ApiKeyService.ApiKey = ApiKey;
                 enumPage = EnumPage.SecondPage;
                 StateHasChanged();
             }
         }

         private void GoBack()
         {
             enumPage = EnumPage.FirstPage;
             StateHasChanged();
         }

         private async Task CheckSpelling()
         {
             // Placeholder for API call (implemented in Step 5)
             CorrectedText = "Checking...";
             Corrections = "";
             StateHasChanged();
         }
     }
     ```

4. **Initialize Preline**:
   - Add a small JS file `wwwroot/js/preline-init.js`:
     ```javascript
     window.HS = require('preline/dist/preline.min.js');
     ```
   - Update `index.html` to include it:
     ```html
     <script src="/js/preline-init.js" defer></script>
     ```

---

## Step 5: Implement the Myanmar Spell Checker Logic

Now, let’s connect to the Gemini API to perform spell checking.

1. **Add JSON Support**:
   - Install the `System.Text.Json` NuGet package (already included in .NET 8, but ensure it’s referenced).

2. **Update `CheckSpelling` Method**:
   - Replace the placeholder `CheckSpelling` method in `Index.razor` with:
     ```csharp
     private async Task CheckSpelling()
     {
         if (string.IsNullOrEmpty(InputText))
         {
             CorrectedText = "ကျေးဇူးပြု၍ စာသားထည့်ပါ။";
             Corrections = string.Empty;
             StateHasChanged();
             return;
         }

         try
         {
             var apiKey = ApiKeyService.ApiKey;
             if (string.IsNullOrEmpty(apiKey))
             {
                 CorrectedText = "API Key မရှိပါ။";
                 Corrections = string.Empty;
                 StateHasChanged();
                 return;
             }

             var requestUri = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={apiKey}";
             var prompt = $"Correct the spelling of the following Myanmar text. Return the result in this format:\n" +
                         $"Corrected: [corrected text here]\n" +
                         $"Fixes: [list each correction as 'original -> corrected', separated by commas, or 'None' if no changes]\n\n" +
                         $"Text: {InputText}";

             var requestBody = new
             {
                 contents = new[] { new { parts = new[] { new { text = prompt } } } },
                 generationConfig = new { temperature = 0.1, maxOutputTokens = 500 }
             };

             var response = await Http.PostAsJsonAsync(requestUri, requestBody);

             if (response.IsSuccessStatusCode)
             {
                 var jsonResponse = await response.Content.ReadAsStringAsync();
                 var result = JsonSerializer.Deserialize<GeminiResponse>(jsonResponse,
                     new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                 var rawResponse = result?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text?.Trim() ?? InputText;
                 CorrectedText = ExtractCorrectedText(rawResponse) ?? InputText;
                 Corrections = ExtractCorrections(rawResponse) ?? "မူရင်းနှင့် အတူတူဖြစ်သည်။";
             }
             else
             {
                 CorrectedText = $"စစ်ဆေးရာတွင် အမှားတစ်ခုဖြစ်ပေါ်ခဲ့သည်။ (Error: {response.StatusCode})";
                 Corrections = string.Empty;
             }
         }
         catch (Exception ex)
         {
             CorrectedText = $"အမှား: {ex.Message}";
             Corrections = string.Empty;
         }
         finally
         {
             StateHasChanged();
         }
     }

     private string ExtractCorrectedText(string response)
     {
         var correctedPrefix = "Corrected: ";
         var startIndex = response.IndexOf(correctedPrefix);
         if (startIndex == -1) return null;

         startIndex += correctedPrefix.Length;
         var endIndex = response.IndexOf("\n", startIndex);
         if (endIndex == -1) endIndex = response.Length;

         return response.Substring(startIndex, endIndex - startIndex).Trim();
     }

     private string ExtractCorrections(string response)
     {
         var fixesPrefix = "Fixes: ";
         var startIndex = response.IndexOf(fixesPrefix);
         if (startIndex == -1) return null;

         startIndex += fixesPrefix.Length;
         var corrections = response.Substring(startIndex).Trim();
         return corrections == "None" ? "ပြင်ဆင်စရာမလိုပါ။" : corrections;
     }

     private class GeminiResponse
     {
         public Candidate[] Candidates { get; set; }
     }

     private class Candidate
     {
         public Content Content { get; set; }
     }

     private class Content
     {
         public Part[] Parts { get; set; }
     }

     private class Part
     {
         public string Text { get; set; }
     }
     ```

3. **Test the App**:
   - Run `dotnet run` again.
   - Enter a valid Gemini API key (get one from [Google’s AI Studio](https://aistudio.google.com/)), then input Myanmar text like "မြန်မာစာ စစ်ဆေးရန်" and click "စစ်ဆေးမည်". The app will fetch corrections from the Gemini API.

---

## Step 6: Final Touches and Deployment

1. **Enhance Styling**:
   - Use more Preline components (e.g., buttons, forms) from [Preline’s docs](https://preline.co/docs/index.html) to polish the UI further.

2. **Deploy to GitHub Pages or Azure**:
   - Build the app:
     ```bash
     dotnet publish -c Release
     ```
   - Deploy the `bin/Release/net8.0/publish/wwwroot` folder to your hosting provider.
