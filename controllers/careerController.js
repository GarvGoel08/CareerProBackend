const { catchAsyncError } = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Career = require("../models/career");


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateCareerPlan = catchAsyncError(async (req, res, next) => {
  const { career, classs, college } = req.body;

  if (!career || !classs) {
    return next(new ErrorHandler("Please provide career and classs", 400));
  }
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are an AI assistant that helps users create career plans. Here are the user inputs:

    **Inputs**:
    - career: ${career} (e.g., Software Engineer)
    - classs: ${classs} (e.g., 11th Class)
    - college: ${college || "N/A"} (Optional)

    **Task**: Generate a detailed career plan in a list format with titles and descriptions for each step the user should take to achieve their desired career.  

    **Example Output**:
    {
      "steps": [
        {
          "title": "Focus on Core Subjects in 11th and 12th",
          "description": "As someone aiming for an Engineering career, excelling in Physics, Mathematics, and Chemistry is crucial. These subjects form the foundation for engineering disciplines. Additionally, take computer science as an elective if available. Practice regularly with problems and explore online resources to deepen your understanding."
        },
        {
          "title": "Identify your Engineering Specialization",
          "description": "Engineering encompasses various fields like Civil, Mechanical, Computer Science, etc. Research different specializations to discover one that aligns with your interests and skills. Talk to professionals in the field to gain insights."
        },
        {
          "title": "Prepare for Entrance Exams",
          "description": "IITs and other prestigious colleges require entrance exams like JEE Mains and JEE Advanced.  Focus on understanding concepts and problem-solving techniques. Consider coaching classes or online resources to supplement your preparation. Utilize previous years' papers and mock tests for practice."
        },
        {
          "title": "Develop your Skills and Build a Strong Portfolio (Optional)",
          "description": "While entrance exams are important, demonstrating your passion and skills can strengthen your application. Participate in science fairs, engineering design competitions, or relevant online courses. Consider creating a portfolio showcasing your projects and accomplishments."
        },
        {
          "title": "Seek Internship Opportunities (Optional)",
          "description": "Internships provide valuable hands-on experience and help you explore different engineering fields. Look for internships related to your chosen specialization. This experience can strengthen your resume and give you a competitive edge."
        },
        {
          "title": "College and Beyond",
          "description": "Getting into an IIT or a top engineering college will provide you with excellent opportunities and a strong foundation for your career. Engineering is a vast field with various specializations and career paths. Keep learning, explore new technologies, and network with professionals to build a successful career. Your Salary would be .."
        }
      ]
      OUTPUT SHOULD BE IN JSON FORMAT AS ABOVE, I SHOULD BE ABLE TO PARSE IT DIRECTLY..
    }
  `;

  try {

    // Use GenerateContent class constructor
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const careerPlanText = response.candidates[0].content.parts[0].text;
    const trimmedResponse = careerPlanText.replace(/```json|```/g, '').trim();
    const careerPlan = JSON.parse(trimmedResponse);
    res.json(careerPlan);

  } catch (error) {
    console.error("Error fetching career plan from Gemini:", error);
    return next(
      new ErrorHandler("Error fetching career plan from Gemini", 500)
    );
  }
});

exports.saveCareerPlan = catchAsyncError(async (req, res, next) => {
  const { career, classs, college, steps } = req.body;
  const userId = req.user._id;

  if (!career || !classs || !steps) {
    return next(new ErrorHandler("Please provide career, classs, and steps", 400));
  }

  try {
    const careerPlan = await Career.create({
      userId,
      career,
      classs,
      college,
      steps,
    });

    res.status(201).json({
      success: true,
      careerPlan
    });
  } catch (error) {
    console.error("Error saving career plan:", error);
    return next(new ErrorHandler("Error saving career plan", 500));
  }
});

exports.getCareerPlan = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;

  try {
    const careerPlan = await Career.find({ userId });
    if (!careerPlan) {
      return next(new ErrorHandler("No career plan found for this user", 404));
    }

    res.json(careerPlan);
  } catch (error) {
    console.error("Error fetching career plan:", error);
    return next(new ErrorHandler("Error fetching career plan", 500));
  }
});