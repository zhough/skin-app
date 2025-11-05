// 皮肤类型判断逻辑
export function determineSkinType(answers) {
  const scores = {
    '干性': 0,
    '中性': 0,
    '油性': 0,
    '混合性': 0,
    '敏感性': 0
  };

  // 问题1
  if (answers.q1 === '紧绷') {
    scores['干性'] += 1;
    scores['敏感性'] += 1;
  } else if (answers.q1 === '正常') {
    scores['中性'] += 1;
  } else if (answers.q1 === '轻微油腻') {
    scores['混合性'] += 1;
  } else if (answers.q1 === '明显油腻') {
    scores['油性'] += 1;
  }

  // 问题2
  if (answers.q2 === '不油') {
    scores['干性'] += 1;
  } else if (answers.q2 === '轻微油光') {
    scores['中性'] += 1;
  } else if (answers.q2 === '明显油光') {
    scores['油性'] += 1;
    scores['混合性'] += 1;
  } else if (answers.q2 === '反光') {
    scores['油性'] += 2;
  }

  // 问题3
  if (answers.q3 === '几乎看不见') {
    scores['中性'] += 1;
  } else if (answers.q3 === 'T区可见') {
    scores['混合性'] += 1;
  } else if (answers.q3 === '全脸可见') {
    scores['油性'] += 1;
  } else if (answers.q3 === '粗大明显') {
    scores['油性'] += 2;
  }

  // 问题4
  if (answers.q4 === '经常') {
    scores['敏感性'] += 2;
  } else if (answers.q4 === '偶尔') {
    scores['敏感性'] += 1;
  }

  // 问题5
  if (answers.q5 === '经常') {
    scores['干性'] += 2;
  } else if (answers.q5 === '偶尔') {
    scores['干性'] += 1;
  }

  // 找出最高分
  let maxScore = 0;
  let skinType = '';
  for (const type in scores) {
    if (scores[type] > maxScore) {
      maxScore = scores[type];
      skinType = type;
    }
  }

  return skinType;
}

// 皮肤类型建议
export function getSkinTypeAdvice(skinType) {
  const adviceMap = {
    '干性': '使用滋润型清洁产品和高保湿面霜，避免使用酒精类产品，注意防晒。',
    '中性': '继续保持良好的护肤习惯，定期去角质，注意保湿和防晒。',
    '油性': '使用控油清洁产品，避免油腻护肤品，定期深层清洁，注意保湿和防晒。',
    '混合性': 'T区使用控油产品，U区注意保湿，定期去角质，注意防晒。',
    '敏感性': '使用温和无刺激的护肤品，避免过度清洁和去角质，注意防晒，避免接触过敏原。'
  };
  
  return adviceMap[skinType] || '请咨询专业皮肤科医生获取个性化建议。';
}