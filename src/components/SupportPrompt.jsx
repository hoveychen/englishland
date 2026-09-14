import React from 'react';
import {Volume1,Play} from 'lucide-react';
export default function SupportPrompt({mode='unknown',sentence,onSpeak}){if(mode==='silence')return <div className="support-panel"><b>没关系，先听一小段</b><button onClick={onSpeak}><Volume1 size={16}/> 听句首提示</button></div>;if(mode==='partial')return <div className="support-panel"><b>我听到了！再说完整一点</b><button onClick={onSpeak}><Volume1 size={16}/> 听句首提示</button></div>;return <div className="support-panel"><b>一起试试这句话</b><div><Play size={15}/> “{sentence}”</div></div>}
