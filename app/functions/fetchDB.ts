export interface questions {
    _id: string;
    question: string;
    question_sanitized: string;
    answer: string;
    answer_sanitized: string;
}

export const fetchDBQuestions = async ({difficulties, categories, questionType}:any ): Promise<questions[]> => {
    let url = `https://qbreader.org/api/query?randomize=true`
    if(difficulties !== undefined){
        url += `&difficulties=${difficulties}`;
    }
    if(categories !== undefined){
        url += `&categories=${categories}`;
    }
    if(questionType !== undefined){
        url += `&questionType=${questionType}`;
    }
    console.log(url)
    const response = await fetch(url);
    const data = await response.json();
    const questions = data.tossups.questionArray.slice(0, 1);
    return questions;
}

export const fetchDBQuestionsNoSearch = async (): Promise<questions[]> => {
    const response = await fetch(`https://www.qbreader.org/api/query?difficulties=3&randomize=true`);
    const data = await response.json();
    const questions = data.tossups.questionArray.slice(0, 1);

    return questions;
}

export const fetchRandomQuestion = async (): Promise<questions> => {
    const response = await fetch("https://www.qbreader.org/api/random-tossup")
    const data = await response.json();
    const [question] = data.tossups;
    return question;
}