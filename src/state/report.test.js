import {buildReport} from './report.js';
const r=buildReport({scaffoldCount:2,events:[{type:'speech',text:'First then under chair'},{type:'speech',text:'because raining'},{type:'success',complete:true},{type:'retell'}]});
if(r.activeSpeaking!==2||r.completeSentences!==1||r.locationExpressions!==1||r.sequenceExpressions!==1||r.reasonExpressions!==1||r.scaffoldCount!==2||r.retellTurns!==1)throw Error('report test failed');console.log('report: sample passed');
